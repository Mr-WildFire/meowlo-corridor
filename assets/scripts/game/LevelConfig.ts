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
    /** Extra loops carved into the perfect maze (0–0.1). More loops = easier. */
    braid: number;
    /** BFS distance range for the exit after the last fragment. */
    exitMin: number;
    exitMax: number;
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
        braid: 0.08,
        exitMin: 3,
        exitMax: 5,
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
        cols: 15,
        rows: 19,
        fragments: 4,
        timeLimit: 420,
        braid: 0.05,
        exitMin: 4,
        exitMax: 6,
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
        cols: 19,
        rows: 23,
        fragments: 5,
        timeLimit: 540,
        braid: 0,
        exitMin: 6,
        exitMax: 9,
        itemCounts: {
            butterfly: 2,
            firefly: 2,
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

/** Small teaching maze: 2 shards, 2 items. */
export const TUTORIAL_LEVEL: LevelConfig = {
    id: 'easy',
    label: '新手教程',
    subtitle: '跟着蝙蝠进入回廊',
    cols: 7,
    rows: 7,
    fragments: 2,
    timeLimit: 300,
    braid: 0.18,
    exitMin: 1,
    exitMax: 2,
    itemCounts: {
        butterfly: 1,
        firefly: 1,
    },
};
