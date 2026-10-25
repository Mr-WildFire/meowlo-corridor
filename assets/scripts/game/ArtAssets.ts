import { resources, SpriteFrame } from 'cc';
import { ItemType } from './DemoTypes';

export type CatDir = 'down' | 'up' | 'left' | 'right';

export type CatFrames = Record<CatDir, SpriteFrame[]>;

export interface ArtAssets {
    cat: CatFrames | null;
    floor: SpriteFrame | null;
    wall: SpriteFrame | null;
    fragment: SpriteFrame | null;
    exit: SpriteFrame | null;
    cd: SpriteFrame | null;
    owner: SpriteFrame | null;
    ownerTimeout: SpriteFrame | null;
    items: Partial<Record<ItemType, SpriteFrame>>;
}

const CAT_DIRS: CatDir[] = ['down', 'up', 'left', 'right'];

const ITEM_FILES: Record<ItemType, string> = {
    butterfly: 'butterfly',
    firefly: 'firefly',
    wine: 'wine',
    catStrip: 'cat_strip',
    sewer: 'sewer',
    fish: 'fish',
    yarn: 'yarn',
    feather: 'feather',
};

function loadSprite(path: string): Promise<SpriteFrame | null> {
    return new Promise((resolve) => {
        resources.load(path, SpriteFrame, (err, asset) => {
            if (err || !asset) {
                console.warn('[ArtAssets] missing sprite:', path, err);
                resolve(null);
                return;
            }
            resolve(asset);
        });
    });
}

/**
 * Loads optional placeholder art from resources.
 * Every field can be null, in which case the caller keeps its Graphics fallback.
 */
export async function loadArtAssets(): Promise<ArtAssets> {
    // Six walking frames per direction (frames 1..6; 0 and 7 are seated\n    // transitions in the supplied sequence).
    // turnaround sheet.
    const catPaths: Array<{ dir: CatDir; index: number; path: string }> = [];
    for (const dir of CAT_DIRS) {
        for (let i = 0; i < 8; i++) {
            catPaths.push({ dir, index: i, path: `art/cat/cat_${dir}_${i}/spriteFrame` });
        }
    }

    const catAssets = await Promise.all(catPaths.map(async ({ dir, index, path }) => {
        const frame = await loadSprite(path);
        return { dir, index, frame };
    }));

    const cat: CatFrames | null = CAT_DIRS.every((dir) =>
        catAssets.filter((x) => x.dir === dir && !!x.frame).length === 8,
    )
        ? {
              down: catAssets.filter((x) => x.dir === 'down').sort((a, b) => a.index - b.index).slice(1, 7).map((x) => x.frame!),
              up: catAssets.filter((x) => x.dir === 'up').sort((a, b) => a.index - b.index).slice(1, 7).map((x) => x.frame!),
              left: catAssets.filter((x) => x.dir === 'left').sort((a, b) => a.index - b.index).slice(1, 7).map((x) => x.frame!),
              right: catAssets.filter((x) => x.dir === 'right').sort((a, b) => a.index - b.index).slice(1, 7).map((x) => x.frame!),
          }
        : null;

    const [floor, wall, fragment, exit, cd, owner, ownerTimeout] = await Promise.all([
        loadSprite('art/board/floor/spriteFrame'),
        loadSprite('art/board/wall/spriteFrame'),
        loadSprite('art/props/fragment/spriteFrame'),
        loadSprite('art/props/exit/spriteFrame'),
        loadSprite('art/props/cd/spriteFrame'),
        loadSprite('art/props/owner/spriteFrame'),
        loadSprite('art/props/owner_timeout/spriteFrame'),
    ]);

    const itemEntries = await Promise.all(
        (Object.keys(ITEM_FILES) as ItemType[]).map(async (type) => {
            const frame = await loadSprite(`art/props/${ITEM_FILES[type]}/spriteFrame`);
            return [type, frame] as const;
        }),
    );

    const items: Partial<Record<ItemType, SpriteFrame>> = {};
    for (const [type, frame] of itemEntries) {
        if (frame) items[type] = frame;
    }

    const result: ArtAssets = { cat, floor, wall, fragment, exit, cd, owner, ownerTimeout, items };
    console.log('[ArtAssets] loaded', {
        cat: !!cat,
        floor: !!floor,
        wall: !!wall,
        fragment: !!fragment,
        exit: !!exit,
        cd: !!cd,
        owner: !!owner,
        ownerTimeout: !!ownerTimeout,
        items: Object.keys(items).length,
    });
    return result;
}



