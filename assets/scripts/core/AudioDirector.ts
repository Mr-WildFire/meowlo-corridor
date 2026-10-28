import { AudioClip, AudioSource, Node, resources } from 'cc';
import { MusicDirector } from './MusicDirector';

type MusicDifficulty = 'easy' | 'normal' | 'hard';

const STEMS = ['vocals', 'drums', 'bass', 'other'] as const;
// `chorus` is metadata only: chorus.wav is already trimmed to start there.
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
 * Four-stem low-volume loop + original-song chorus.
 *
 * The four stems start together on the first collected shard and stay in sync.
 * Each new shard reveals the next stem at a low volume. On the last shard the
 * stems stop and the pre-trimmed original chorus plays at full volume.
 */
export class AudioDirector {
    private root: Node | null = null;
    private parent: Node | null = null;
    private stems: AudioSource[] = [];
    private chorusSource: AudioSource | null = null;
    private loaded = false;
    private current: MusicDifficulty | null = null;
    private unlocked = 0;
    private activeTracks = [false, false, false, false];
    private stemStarted = false;
    private chorusPlaying = false;
    private climaxRequested = false;
    private muted = false;
    private volume = 0.7;
    private readonly fallback = new MusicDirector();

    async load(parent: Node): Promise<boolean> {
        this.parent = parent;
        return true;
    }

    async loadSong(difficulty: MusicDifficulty): Promise<boolean> {
        if (this.loaded && this.current === difficulty) {
            this.stop();
            this.unlocked = 0;
            this.activeTracks = [false, false, false, false];
            return true;
        }

        this.stop();
        this.clearSources();
        this.unlocked = 0;
        this.activeTracks = [false, false, false, false];
        this.current = difficulty;
        const config = SONGS[difficulty];

        const stemClips = await Promise.all(
            STEMS.map((stem) => loadClip(`${config.folder}stem_${stem}`)),
        );
        const chorusClip = await loadClip(config.folder + 'chorus');
        console.log('[AudioDirector] loadSong', difficulty, 'stems=', stemClips.filter(Boolean).length, 'chorus=', !!chorusClip);
        if (stemClips.some((clip) => !clip) || !chorusClip || !this.parent) {
            console.warn('[AudioDirector] song missing:', difficulty);
            return false;
        }

        const root = new Node('MusicRoot_' + difficulty);
        root.parent = this.parent;
        this.root = root;

        this.stems = stemClips.map((clip, i) => {
            const node = new Node('Stem_' + STEMS[i]);
            node.parent = root;
            const source = node.addComponent(AudioSource);
            source.clip = clip;
            source.loop = true;
            source.playOnAwake = false;
            source.volume = 0;
            return source;
        });

        const chorusNode = new Node('OriginalChorus');
        chorusNode.parent = root;
        this.chorusSource = chorusNode.addComponent(AudioSource);
        this.chorusSource.clip = chorusClip;
        this.chorusSource.loop = true;
        this.chorusSource.playOnAwake = false;
        this.chorusSource.volume = 0;

        this.loaded = true;
        if (this.climaxRequested) {
            this.climax();
            return true;
        }
        if (this.unlocked > 0) this.startStems();
        this.applyVolumes();
        return true;
    }

    /** Called after every non-final shard with the randomly chosen stem index. */
    unlockTrack(index: number): void {
        if (index < 0 || index >= STEMS.length) return;
        this.activeTracks[index] = true;
        this.unlocked = this.activeTracks.filter(Boolean).length;
        if (!this.loaded || this.chorusPlaying) return;
        if (!this.stemStarted) this.startStems();
        this.applyVolumes();
    }

    /** Compatibility helper for older callers: first N stems in fixed order. */
    setUnlocked(n: number): void {
        this.activeTracks = Array.from({ length: STEMS.length }, (_, i) => i < n);
        this.unlocked = Math.max(0, Math.min(STEMS.length, n));
        if (!this.loaded || this.chorusPlaying) return;
        if (this.unlocked > 0 && !this.stemStarted) this.startStems();
        this.applyVolumes();
    }

    private startStems(): void {
        this.stemStarted = true;
        this.chorusPlaying = false;
        for (const source of this.stems) {
            try {
                source.stop();
                source.currentTime = 0;
                source.loop = true;
                source.play();
            } catch {
                // ignore
            }
        }
        this.applyVolumes();
    }

    start(): void {
        if (this.unlocked > 0 && !this.chorusPlaying) {
            if (!this.stemStarted) this.startStems();
            this.applyVolumes();
        }
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

    /** Stop the loops immediately; DemoGame owns the 2.5s silence before the chorus. */
    silence(): void {
        for (const source of this.stems) {
            try {
                source.stop();
                source.volume = 0;
            } catch {
                // ignore
            }
        }
        this.stemStarted = false;
        this.chorusPlaying = false;
    }

    /** The final shard: stop layers and play the original chorus from sample 0. */
    climax(): void {
        console.log('[AudioDirector] climax', this.current);
        if (!this.loaded) {
            this.climaxRequested = true;
            return;
        }
        this.climaxRequested = false;
        for (const source of this.stems) {
            try {
                source.stop();
                source.volume = 0;
            } catch {
                // ignore
            }
        }
        this.stemStarted = false;
        this.chorusPlaying = true;
        if (this.chorusSource) {
            try {
                this.chorusSource.stop();
                this.chorusSource.currentTime = 0;
                this.chorusSource.loop = true;
                this.chorusSource.play();
            } catch {
                // ignore
            }
        }
        this.applyVolumes();
    }

    pause(): void {
        for (const source of this.stems) source.pause();
        this.chorusSource?.pause();
        this.fallback.pause();
    }

    resume(): void {
        if (this.loaded) {
            if (this.chorusPlaying) this.chorusSource?.play();
            else if (this.stemStarted) for (const source of this.stems) source.play();
            this.applyVolumes();
        }
        this.fallback.resume();
    }

    stop(): void {
        this.unlocked = 0;
        this.activeTracks = [false, false, false, false];
        this.stemStarted = false;
        this.chorusPlaying = false;
        this.climaxRequested = false;
        for (const source of this.stems) {
            try {
                source.stop();
                source.volume = 0;
            } catch {
                // ignore
            }
        }
        try {
            this.chorusSource?.stop();
        } catch {
            // ignore
        }
        this.fallback.stop();
    }

    private applyVolumes(): void {
        const master = this.muted ? 0 : this.volume;
        this.stems.forEach((source, i) => {
            source.volume = this.chorusPlaying || !this.stemStarted || !this.activeTracks[i] ? 0 : 0.16 * master;
        });
        if (this.chorusSource) {
            this.chorusSource.volume = this.chorusPlaying ? 0.82 * master : 0;
        }
    }

    private clearSources(): void {
        this.loaded = false;
        this.stems = [];
        this.chorusSource = null;
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
