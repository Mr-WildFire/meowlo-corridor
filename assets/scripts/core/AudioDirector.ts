import { AudioClip, AudioSource, Node, resources } from 'cc';
import { MusicDirector } from './MusicDirector';

const LAYER_FILES = [
    'ambient',
    'bass',
    'rhythm',
    'melody',
    'harmony',
    'counter',
] as const;

const BASE_PATH = 'audio/music/music_';

function loadClip(name: string): Promise<AudioClip | null> {
    return new Promise((resolve) => {
        resources.load(BASE_PATH + name, AudioClip, (err, clip) => {
            if (err || !clip) {
                console.warn('[AudioDirector] missing clip:', name, err);
                resolve(null);
                return;
            }
            resolve(clip);
        });
    });
}

/**
 * AudioSource-based layered music.
 * Uses placeholder WAV loops now; replacing them with OGG files only changes
 * the resource import, not this class. Falls back to the older procedural
 * MusicDirector if clips are unavailable.
 */
export class AudioDirector {
    private root: Node | null = null;
    private sources: AudioSource[] = [];
    private climaxSource: AudioSource | null = null;
    private climaxClip: AudioClip | null = null;
    private loaded = false;
    private unlocked = 0;
    private muted = false;
    private silent = true;
    private volume = 0.7;
    private readonly fallback = new MusicDirector();

    async load(parent: Node): Promise<boolean> {
        const clips = await Promise.all(LAYER_FILES.map((name) => loadClip(name)));
        const climax = await loadClip('climax');
        if (clips.some((c) => !c) || !climax) {
            console.warn('[AudioDirector] WAV layers unavailable; using procedural fallback');
            return false;
        }

        this.root = new Node('MusicRoot');
        this.root.parent = parent;
        this.sources = clips.map((clip, i) => {
            const n = new Node('Music_' + LAYER_FILES[i]);
            n.parent = this.root;
            const source = n.addComponent(AudioSource);
            source.clip = clip;
            source.loop = true;
            source.playOnAwake = false;
            source.volume = i === 0 ? 0.5 : 0;
            return source;
        });

        const cn = new Node('Music_Climax');
        cn.parent = this.root;
        this.climaxSource = cn.addComponent(AudioSource);
        this.climaxClip = climax;
        this.loaded = true;
        return true;
    }

    start(): void {
        if (!this.loaded) {
            this.fallback.start();
            return;
        }
        this.silent = false;
        this.unlocked = 0;
        this.sources.forEach((source) => {
            try {
                source.stop();
                source.loop = true;
                source.volume = 0;
                source.play();
            } catch {
                // Audio is optional.
            }
        });
        this.applyVolumes();
    }

    setUnlocked(n: number): void {
        this.unlocked = n;
        if (!this.loaded) {
            this.fallback.setUnlocked(n);
            return;
        }
        this.applyVolumes();
    }

    setMuted(muted: boolean): void {
        this.muted = muted;
        this.applyVolumes();
        if (!this.loaded) this.fallback.setMuted(muted);
    }

    setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(1, volume));
        this.applyVolumes();
        if (!this.loaded) this.fallback.setVolume(this.volume);
    }

    silence(seconds: number): void {
        this.silent = true;
        if (!this.loaded) {
            this.fallback.silence(seconds);
            return;
        }
        for (const source of this.sources) source.volume = 0;
    }

    climax(): void {
        this.silent = true;
        if (!this.loaded) {
            this.fallback.climax();
            return;
        }
        for (const source of this.sources) {
            try {
                source.stop();
            } catch {
                // ignore
            }
        }
        if (!this.muted && this.volume > 0 && this.climaxSource && this.climaxClip) {
            this.climaxSource.playOneShot(this.climaxClip, 0.95 * this.volume);
        }
    }

    pause(): void {
        if (!this.loaded) {
            this.fallback.pause();
            return;
        }
        for (const source of this.sources) source.pause();
    }

    resume(): void {
        if (!this.loaded) {
            this.fallback.resume();
            return;
        }
        this.silent = false;
        for (const source of this.sources) source.play();
        this.applyVolumes();
    }

    stop(): void {
        this.silent = true;
        if (!this.loaded) {
            this.fallback.stop();
            return;
        }
        for (const source of this.sources) {
            try {
                source.stop();
                source.volume = 0;
            } catch {
                // ignore
            }
        }
        if (this.climaxSource) this.climaxSource.stop();
    }

    private applyVolumes(): void {
        if (!this.loaded) return;
        this.sources.forEach((source, i) => {
            const base = i === 0 ? 0.5 : i <= this.unlocked ? 0.32 : 0;
            source.volume = this.silent || this.muted ? 0 : base * this.volume;
        });
    }

    dispose(): void {
        this.stop();
        this.fallback.dispose();
        if (this.root?.isValid) this.root.destroy();
        this.root = null;
        this.sources = [];
        this.climaxSource = null;
        this.climaxClip = null;
        this.loaded = false;
    }
}
