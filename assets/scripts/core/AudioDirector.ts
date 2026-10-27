import { AudioClip, AudioSource, Node, resources } from 'cc';
import { MusicDirector } from './MusicDirector';

type MusicDifficulty = 'easy' | 'normal' | 'hard';

/** Each difficulty owns one mixed four-stem song and one chorus timestamp. */
const SONGS: Record<MusicDifficulty, { folder: string; chorus: number }> = {
    easy: { folder: 'audio/music/easy/', chorus: 58 },
    normal: { folder: 'audio/music/normal/', chorus: 58 },
    hard: { folder: 'audio/music/hard/', chorus: 65 },
};

function loadClip(path: string): Promise<AudioClip | null> {
    return new Promise((resolve) => {
        resources.load(path, AudioClip, (err, clip) => {
            if (err || !clip) {
                console.warn('[AudioDirector] missing clip:', path, err);
                resolve(null);
                return;
            }
            resolve(clip);
        });
    });
}

/**
 * Four-stem soundtrack mixed into one WAV.
 *
 * The OHOS native audio backend only ships a WAV decoder, so MP3 stems are
 * pre-mixed offline into `mix.wav` (16kHz mono). One AudioSource avoids
 * multi-source native decoder/channel issues. The song starts after the last
 * shard; after CD assembly it seeks to the chorus timestamp.
 */
export class AudioDirector {
    private root: Node | null = null;
    private parent: Node | null = null;
    private sources: AudioSource[] = [];
    private loaded = false;
    private requested = false;
    private current: MusicDifficulty | null = null;
    private chorus = 0;
    private muted = false;
    private silent = true;
    private volume = 0.7;
    private readonly fallback = new MusicDirector();

    async load(parent: Node): Promise<boolean> {
        this.parent = parent;
        return true;
    }

    async loadSong(difficulty: MusicDifficulty): Promise<boolean> {
        if (this.loaded && this.current === difficulty) return true;

        this.stop();
        this.clearSources();
        this.current = difficulty;
        const config = SONGS[difficulty];
        this.chorus = config.chorus;

        const clip = await loadClip(config.folder + 'mix');
        if (!clip || !this.parent) {
            console.warn('[AudioDirector] song missing:', difficulty);
            return false;
        }

        const root = new Node('MusicRoot_' + difficulty);
        root.parent = this.parent;
        this.root = root;
        const node = new Node('Music_Mix');
        node.parent = root;
        const source = node.addComponent(AudioSource);
        source.clip = clip;
        source.loop = true;
        source.playOnAwake = false;
        source.volume = 0;
        this.sources = [source];
        this.loaded = true;
        this.applyVolumes();
        if (this.requested) this.startLoaded();
        return true;
    }

    start(): void {
        this.requested = true;
        if (this.loaded) this.startLoaded();
    }

    private startLoaded(): void {
        this.silent = false;
        for (const source of this.sources) {
            try {
                source.stop();
                source.currentTime = 0;
                source.loop = true;
                source.play();
            } catch {
                // Audio is optional.
            }
        }
        this.applyVolumes();
    }

    setUnlocked(_n: number): void {
        // The song is not progressively revealed; it starts after all shards.
    }

    setMuted(muted: boolean): void {
        this.muted = muted;
        this.applyVolumes();
        this.fallback.setMuted(muted);
    }

    setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(1, volume));
        this.applyVolumes();
        this.fallback.setVolume(this.volume);
    }

    silence(_seconds: number): void {
        this.silent = true;
        for (const source of this.sources) source.volume = 0;
        this.fallback.silence(_seconds);
    }

    /** Jump to the chorus after the CD assembly animation. */
    climax(): void {
        if (!this.loaded) {
            this.fallback.climax();
            return;
        }
        this.silent = false;
        for (const source of this.sources) {
            try {
                source.stop();
                source.currentTime = this.chorus;
                source.loop = true;
                source.play();
            } catch {
                // ignore
            }
        }
        this.applyVolumes();
    }

    pause(): void {
        for (const source of this.sources) source.pause();
        this.fallback.pause();
    }

    resume(): void {
        if (this.requested && this.loaded) {
            this.silent = false;
            for (const source of this.sources) source.play();
            this.applyVolumes();
        }
        this.fallback.resume();
    }

    stop(): void {
        this.requested = false;
        this.silent = true;
        for (const source of this.sources) {
            try {
                source.stop();
                source.volume = 0;
            } catch {
                // ignore
            }
        }
        this.fallback.stop();
    }

    private applyVolumes(): void {
        for (const source of this.sources) {
            source.volume = this.silent || this.muted ? 0 : 0.65 * this.volume;
        }
    }

    private clearSources(): void {
        this.loaded = false;
        this.sources = [];
        if (this.root?.isValid) this.root.destroy();
        this.root = null;
    }

    dispose(): void {
        this.stop();
        this.clearSources();
        this.current = null;
        this.parent = null;
        this.fallback.dispose();
    }
}