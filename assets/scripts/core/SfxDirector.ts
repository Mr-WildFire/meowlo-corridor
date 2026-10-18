import { AudioClip, AudioSource, Node, resources } from 'cc';

export type SfxName = 'click' | 'pickup' | 'win' | 'timeout' | 'step';

const SFX_PATHS: Record<SfxName, string> = {
    click: 'audio/sfx/sfx_click',
    pickup: 'audio/sfx/sfx_pickup',
    win: 'audio/sfx/sfx_win',
    timeout: 'audio/sfx/sfx_timeout',
    step: 'audio/sfx/sfx_step',
};

/**
 * File-based SFX for native and web.
 * ToneSynth remains the browser-only fallback; this director works with
 * AudioSource so the same cues can play in the HarmonyOS HAP.
 */
export class SfxDirector {
    private readonly node: Node;
    private readonly source: AudioSource;
    private readonly clips: Partial<Record<SfxName, AudioClip>> = {};
    private volume = 0.8;
    private muted = false;
    private loaded = false;

    constructor(parent: Node) {
        this.node = new Node('SfxRoot');
        parent.addChild(this.node);
        this.source = this.node.addComponent(AudioSource);
        this.source.playOnAwake = false;
    }

    async load(): Promise<void> {
        const entries = await Promise.all(
            (Object.keys(SFX_PATHS) as SfxName[]).map(
                (name) =>
                    new Promise<[SfxName, AudioClip | null]>((resolve) => {
                        resources.load(SFX_PATHS[name], AudioClip, (err, clip) => {
                            if (err || !clip) {
                                console.warn('[SfxDirector] missing clip:', SFX_PATHS[name], err);
                                resolve([name, null]);
                                return;
                            }
                            resolve([name, clip]);
                        });
                    }),
            ),
        );
        for (const [name, clip] of entries) {
            if (clip) this.clips[name] = clip;
        }
        this.loaded = true;
    }

    setMuted(muted: boolean): void {
        this.muted = muted;
    }

    setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    click(): void {
        this.play('click', 0.55);
    }

    pickup(): void {
        this.play('pickup', 0.8);
    }

    win(): void {
        this.play('win', 0.9);
    }

    timeout(): void {
        this.play('timeout', 0.85);
    }

    step(): void {
        this.play('step', 0.25);
    }

    private play(name: SfxName, scale: number): void {
        if (!this.loaded || this.muted || this.volume <= 0) return;
        const clip = this.clips[name];
        if (!clip) return;
        this.source.playOneShot(clip, scale * this.volume);
    }
}
