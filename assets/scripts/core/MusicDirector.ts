/**
 * Browser-only placeholder for the layered soundtrack.
 *
 * It deliberately has the same public shape as the future OGG AudioDirector:
 * base loop + one layer per fragment + 1s silence + climax.
 * On HarmonyOS/native (no WebAudio), every method becomes a no-op.
 */
const BPM = 80;
const STEP = 60 / BPM / 4; // 16th note
const PATTERN_STEPS = 64; // 8 beats
const LAYER_COUNT = 6; // ambient + bass + rhythm + melody + harmony + counter

const MELODY = [293.66, 349.23, 392.0, 440.0, 392.0, 349.23, 293.66, 261.63];

export class MusicDirector {
    private ctx: any = null;
    private master: any = null;
    private layers: any[] = [];
    private timer: ReturnType<typeof setInterval> | null = null;
    private step = 0;
    private nextTime = 0;
    private playing = false;
    private unlocked = 0;
    private mutedUntil = 0;
    private enabled = true;

    start(): void {
        if (!this.ensure()) return;
        this.stopScheduler();
        this.playing = true;
        this.mutedUntil = 0;
        this.step = 0;
        this.nextTime = this.ctx.currentTime + 0.08;
        this.master.gain.cancelScheduledValues(this.ctx.currentTime);
        this.master.gain.setValueAtTime(0.16, this.ctx.currentTime);
        this.setUnlocked(0);
        this.resumeContext();
        this.timer = setInterval(() => this.schedule(), 25);
        this.schedule();
    }

    /** n = collected fragments; layer 0 is the always-on ambient bed. */
    setUnlocked(n: number): void {
        this.unlocked = Math.max(0, Math.min(LAYER_COUNT - 1, n));
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        for (let i = 0; i < this.layers.length; i++) {
            const target = i === 0 ? 0.5 : i <= this.unlocked ? 0.3 : 0;
            const param = this.layers[i].gain.gain;
            param.cancelScheduledValues(now);
            param.setTargetAtTime(target, now, 0.3);
        }
    }

    /** Fade music out for the finale silence. */
    silence(seconds: number): void {
        if (!this.ensure()) return;
        this.mutedUntil = this.ctx.currentTime + seconds;
        const now = this.ctx.currentTime;
        for (const layer of this.layers) {
            const param = layer.gain.gain;
            param.cancelScheduledValues(now);
            param.linearRampToValueAtTime(0, now + 0.12);
        }
    }

    /** Loud final chord after the 1s silence; the loop stops underneath it. */
    climax(): void {
        if (!this.ensure()) return;
        this.stopScheduler();
        this.playing = false;
        this.mutedUntil = 0;
        const now = this.ctx.currentTime + 0.03;
        const chord = [146.83, 220.0, 293.66, 349.23, 440.0];
        chord.forEach((f, i) => this.noteDirect(f, now + i * 0.025, 2.2, 0.7, i < 2 ? 'triangle' : 'sine'));
    }

    pause(): void {
        if (!this.ctx) return;
        if (this.ctx.state === 'running') void this.ctx.suspend();
    }

    resume(): void {
        this.resumeContext();
    }

    stop(): void {
        this.stopScheduler();
        this.playing = false;
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            this.master.gain.cancelScheduledValues(now);
            this.master.gain.setTargetAtTime(0, now, 0.08);
        } catch {
            // Audio is optional.
        }
    }

    dispose(): void {
        this.stopScheduler();
        if (!this.ctx) return;
        try {
            void this.ctx.close();
        } catch {
            // ignore
        }
        this.ctx = null;
        this.master = null;
        this.layers = [];
        this.playing = false;
    }

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
            this.master.gain.value = 0.16;
            this.master.connect(this.ctx.destination);
            this.layers = [];
            for (let i = 0; i < LAYER_COUNT; i++) {
                const gain = this.ctx.createGain();
                gain.gain.value = i === 0 ? 0.5 : 0;
                gain.connect(this.master);
                this.layers.push({ gain });
            }
            return true;
        } catch {
            this.enabled = false;
            return false;
        }
    }

    private resumeContext(): void {
        if (this.ctx && this.ctx.state === 'suspended') {
            void this.ctx.resume();
        }
    }

    private schedule(): void {
        if (!this.playing || !this.ctx) return;
        const now = this.ctx.currentTime;
        while (this.nextTime < now + 0.12) {
            this.scheduleStep(this.step, this.nextTime);
            this.nextTime += STEP;
            this.step = (this.step + 1) % PATTERN_STEPS;
        }
    }

    private scheduleStep(step: number, time: number): void {
        if (time < this.mutedUntil) return;

        // 0: ambient pad, always on.
        if (step % 16 === 0) {
            const chord = [146.83, 174.61, 220.0];
            chord.forEach((f, i) => this.note(0, f, time + i * 0.03, 2.4, 0.08, 'sine'));
        }

        // 1: bass.
        if (this.unlocked >= 1 && step % 8 === 0) {
            const bar = Math.floor(step / 16) % 2;
            this.note(1, bar === 0 ? 73.42 : 98.0, time, 1.0, 0.16, 'triangle');
        }

        // 2: soft kick / tick.
        if (this.unlocked >= 2) {
            if (step % 8 === 0) this.note(2, 60, time, 0.18, 0.35, 'sine');
            if (step % 8 === 4) this.note(2, 1200, time, 0.05, 0.08, 'square');
        }

        // 3: melody.
        if (this.unlocked >= 3 && step % 4 === 0) {
            const f = MELODY[(step / 4) % MELODY.length];
            this.note(3, f, time, 0.38, 0.12, 'triangle');
        }

        // 4: harmony.
        if (this.unlocked >= 4 && step % 8 === 2) {
            this.note(4, 220.0, time, 0.9, 0.1, 'sine');
            this.note(4, 261.63, time + 0.04, 0.9, 0.07, 'sine');
        }

        // 5: high counter line.
        if (this.unlocked >= 5 && step % 16 === 8) {
            this.note(5, 587.33, time, 0.5, 0.09, 'sine');
        }
    }

    private note(layer: number, freq: number, when: number, duration: number, gain: number, type: string): void {
        if (!this.ctx || !this.layers[layer]) return;
        const dest = this.layers[layer].gain;
        this.playOsc(freq, when, duration, gain, type, dest);
    }

    private noteDirect(freq: number, when: number, duration: number, gain: number, type: string): void {
        if (!this.ctx || !this.master) return;
        this.playOsc(freq, when, duration, gain, type, this.master);
    }

    private playOsc(freq: number, when: number, duration: number, gain: number, type: string, dest: any): void {
        try {
            const osc = this.ctx.createOscillator();
            const env = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, when);
            env.gain.setValueAtTime(0.0001, when);
            env.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), when + 0.025);
            env.gain.exponentialRampToValueAtTime(0.0001, when + duration);
            osc.connect(env);
            env.connect(dest);
            osc.start(when);
            osc.stop(when + duration + 0.05);
        } catch {
            // Never let placeholder audio break gameplay.
        }
    }

    private stopScheduler(): void {
        if (this.timer !== null) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
}
