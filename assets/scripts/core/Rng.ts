/**
 * Deterministic RNG for maze generation.
 * Do not use Math.random() directly in level logic.
 */
export class Rng {
    private state: number;

    constructor(seed: number) {
        this.state = (seed >>> 0) || 0x9e3779b9;
    }

    next(): number {
        let a = this.state;
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        this.state = a;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    int(maxExclusive: number): number {
        if (maxExclusive <= 0) return 0;
        return Math.floor(this.next() * maxExclusive);
    }

    pick<T>(items: readonly T[]): T {
        return items[this.int(items.length)];
    }

    shuffle<T>(items: T[]): T[] {
        for (let i = items.length - 1; i > 0; i--) {
            const j = this.int(i + 1);
            const tmp = items[i];
            items[i] = items[j];
            items[j] = tmp;
        }
        return items;
    }
}

export function nowSeed(): number {
    return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}
