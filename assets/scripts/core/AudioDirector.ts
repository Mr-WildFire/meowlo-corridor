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
        this.sources.forEach((source, i) => {
            try {
                source.stop();
                source.loop = true;
                source.volume = i === 0 ? 0.5 : 0;
                source.play();
            } catch {
                // Audio is optional.
            }
        });
    }

    setUnlocked(n: number): void {
        if (!this.loaded) {
            this.fallback.setUnlocked(n);
            return;
        }
        this.sources.forEach((source, i) => {
            source.volume = i === 0 ? 0.5 : i <= n ? 0.32 : 0;
        });
    }

    silence(seconds: number): void {
        if (!this.loaded) {
            this.fallback.silence(seconds);
            return;
        }
        for (const source of this.sources) source.volume = 0;
    }

    climax(): void {
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
        if (this.climaxSource && this.climaxClip) {
            this.climaxSource.playOneShot(this.climaxClip, 0.95);
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
        for (const source of this.sources) source.play();
    }

    stop(): void {
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
