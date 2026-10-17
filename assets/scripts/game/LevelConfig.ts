import { ItemType } from './DemoTypes';

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface LevelConfig {
    id: Difficulty;
    label: string;
    subtitle: string;
    cols: number;
    rows: number;
    fragments: number;
    timeLimit: number;
    itemCounts: Partial<Record<ItemType, number>>;
}

/**
 * M1 difficulty data. Values are intentionally kept in one place so the
 * HUD, timer, fragment count and item placement never drift apart.
 */
export const LEVELS: Record<Difficulty, LevelConfig> = {
    easy: {
        id: 'easy',
        label: '轻松',
        subtitle: '先熟悉黑暗与声音',
        cols: 11,
        rows: 13,
        fragments: 3,
        timeLimit: 300,
        itemCounts: {
            butterfly: 1,
            firefly: 1,
            wine: 1,
            catStrip: 1,
            sewer: 1,
            fish: 1,
        },
    },
    normal: {
        id: 'normal',
        label: '标准',
        subtitle: '完整的回廊体验',
        cols: 13,
        rows: 17,
        fragments: 4,
        timeLimit: 420,
        itemCounts: {
            butterfly: 1,
            firefly: 1,
            wine: 1,
            catStrip: 1,
            sewer: 2,
            fish: 1,
            yarn: 1,
        },
    },
    hard: {
        id: 'hard',
        label: '困难',
        subtitle: '更大、更暗、更少回头路',
        cols: 17,
        rows: 19,
        fragments: 5,
        timeLimit: 540,
        itemCounts: {
            butterfly: 2,
            firefly: 1,
            wine: 1,
            catStrip: 2,
            sewer: 2,
            fish: 1,
            yarn: 1,
            feather: 1,
        },
    },
};

export const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'normal', 'hard'];
