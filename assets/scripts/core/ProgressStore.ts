import { sys } from 'cc';
import { Difficulty } from '../game/LevelConfig';

export interface BestRecord {
    stars: number;
    elapsed: number;
}

interface SaveData {
    best: Partial<Record<Difficulty, BestRecord>>;
    muted: boolean;
}

const KEY = 'meowlo.progress.v1';

/**
 * Persistent best stars/time + mute preference.
 * Uses Cocos localStorage so it works in browser and native WebView.
 */
export class ProgressStore {
    private data: SaveData = { best: {}, muted: false };

    constructor() {
        this.load();
    }

    get muted(): boolean {
        return this.data.muted;
    }

    setMuted(muted: boolean): void {
        this.data.muted = muted;
        this.save();
    }

    getBest(difficulty: Difficulty): BestRecord | null {
        return this.data.best[difficulty] ?? null;
    }

    allBest(): Partial<Record<Difficulty, BestRecord>> {
        return { ...this.data.best };
    }

    /** Returns true when this run is a new best. */
    submitWin(difficulty: Difficulty, stars: number, elapsed: number): boolean {
        const old = this.data.best[difficulty];
        const isBest = !old || stars > old.stars || (stars === old.stars && elapsed < old.elapsed);
        if (!isBest) return false;
        this.data.best[difficulty] = { stars, elapsed };
        this.save();
        return true;
    }

    private load(): void {
        try {
            const raw = sys.localStorage.getItem(KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw) as Partial<SaveData>;
            if (parsed && typeof parsed === 'object') {
                this.data.best = parsed.best ?? {};
                this.data.muted = !!parsed.muted;
            }
        } catch {
            this.data = { best: {}, muted: false };
        }
    }

    private save(): void {
        try {
            sys.localStorage.setItem(KEY, JSON.stringify(this.data));
        } catch {
            // Storage can be unavailable in private mode; records simply won't persist.
        }
    }
}
