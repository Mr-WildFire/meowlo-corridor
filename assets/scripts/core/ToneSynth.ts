/**
 * Browser-only placeholder synth for the gameplay skeleton.
 * It demonstrates "each fragment adds a voice" without audio assets.
 * M2 replaces this with the layered OGG AudioDirector.
 */
export class ToneSynth {
    private ctx: any = null;
    private master: any = null;
    private enabled = true;

    private ensure(): boolean {
        if (!this.enabled) return false;
        if (this.ctx) return true;

        const g = globalThis as any;
        const Ctor = g.AudioContext || g.webkitAudioContext;
        if (!Ctor) {
            this.enabled = false;
            return false;
        }

        try {
            this.ctx = new Ctor();
            this.master = this.ctx.createGain();
            this.master.gain.value = 0.22;
            this.master.connect(this.ctx.destination);
            return true;
        } catch (e) {
            this.enabled = false;
            return false;
        }
    }

    private resume(): void {
        if (this.ctx && this.ctx.state === 'suspended') {
            void this.ctx.resume();
        }
    }

    private tone(freq: number, duration: number, when = 0, gain = 0.12, type = 'sine'): void {
        if (!this.ensure()) return;
        this.resume();

        try {
            const t0 = this.ctx.currentTime + when;
            const osc = this.ctx.createOscillator();
            const env = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, t0);
            env.gain.setValueAtTime(0.0001, t0);
            env.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
            env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
            osc.connect(env);
            env.connect(this.master);
            osc.start(t0);
            osc.stop(t0 + duration + 0.05);
        } catch (e) {
            // Audio is a nice-to-have in the skeleton; never break gameplay.
        }
    }

    click(): void {
        this.tone(660, 0.05, 0, 0.05, 'triangle');
    }

    pickup(index: number): void {
        // D minor pentatonic-ish: D F G A C
        const notes = [293.66, 349.23, 392.0, 440.0, 523.25];
        const f = notes[Math.max(0, Math.min(notes.length - 1, index))];
        this.tone(f, 0.5, 0, 0.13, 'sine');
        this.tone(f * 1.5, 0.4, 0.04, 0.06, 'triangle');
    }

    climax(): void {
        const chord = [293.66, 349.23, 440.0, 587.33];
        chord.forEach((f, i) => this.tone(f, 1.6, i * 0.02, 0.11, 'sine'));
        this.tone(146.83, 1.8, 0, 0.08, 'triangle');
    }

    timeout(): void {
        [440.0, 349.23, 293.66, 220.0].forEach((f, i) => this.tone(f, 0.5, i * 0.16, 0.1, 'sine'));
    }

    dispose(): void {
        if (!this.ctx) return;
        try {
            void this.ctx.close();
        } catch (e) {
            // ignore
        }
        this.ctx = null;
        this.master = null;
    }
}
