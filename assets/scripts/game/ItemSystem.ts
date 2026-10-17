import { Color, Node } from 'cc';
import { Rng } from '../core/Rng';
import { GridPos, samePos } from './MazeGenerator';
import { MazeModel } from './MazeModel';
import { ItemType, ItemView } from './DemoTypes';
import { posKey, Theme } from './UiKit';

export const ITEM_META: Record<ItemType, { label: string; color: Color }> = {
    butterfly: { label: '蝶', color: Theme.cyan },
    firefly: { label: '萤', color: Theme.mint },
    wine: { label: '酒', color: Theme.rose },
    catStrip: { label: '条', color: Theme.amber },
    sewer: { label: '井', color: new Color(110, 118, 132, 255) },
    fish: { label: '鱼', color: new Color(255, 209, 120, 255) },
    yarn: { label: '线', color: Theme.rose },
    feather: { label: '羽', color: new Color(120, 92, 150, 255) },
};

export interface ItemContext {
    readonly playerPos: GridPos;
    isTimerStopped(): boolean;
    addTime(seconds: number): void;
    setFirefly(seconds: number): void;
    setWine(seconds: number): void;
    setCatStrip(seconds: number): void;
    setButterfly(steps: number): void;
    setYarn(seconds: number): void;
    teleport(): void;
    toast(text: string): void;
    showTutorial(type: ItemType, text: string): void;
    refreshAll(): void;
}

export const ITEM_TUTORIALS: Record<ItemType, string> = {
    butterfly: '蝴蝶会为你指路 10 步。',
    firefly: '萤火虫把视野扩大到 4 格，持续 10 秒。',
    wine: '鲜花酒让你方向颠倒 10 秒。',
    catStrip: '猫条让你每次移动 2 格，持续 10 秒。',
    sewer: '下水道会把你随机冲走。',
    fish: '小鱼干增加 20 秒倒计时。',
    yarn: '毛线球记住走过的路，持续 15 秒。',
    feather: '蝙蝠黑羽会减少 10 秒倒计时。',
};

/**
 * Item placement + effect dispatch.
 * View creation is injected so the system stays independent of the renderer.
 */
export class ItemSystem {
    place(
        model: MazeModel,
        rng: Rng,
        occupied: Set<string>,
        counts: Partial<Record<ItemType, number>>,
        createNode: (type: ItemType, pos: GridPos) => Node,
    ): ItemView[] {
        const types: ItemType[] = [];
        for (const type of Object.keys(counts) as ItemType[]) {
            const count = counts[type] ?? 0;
            for (let i = 0; i < count; i++) types.push(type);
        }
        rng.shuffle(types);

        const items: ItemView[] = [];
        const start = model.data.start;

        for (const type of types) {
            const p = model.randomCell(
                rng,
                (q) =>
                    !samePos(q, start) &&
                    !occupied.has(posKey(q)) &&
                    model.distance(start, q) >= 3 &&
                    (type !== 'sewer' || model.distance(start, q) >= 4),
            );
            if (!p) continue;

            occupied.add(posKey(p));
            items.push({ type, pos: p, node: createNode(type, p), used: false });
        }
        return items;
    }

    use(item: ItemView, ctx: ItemContext): void {
        if (item.used) return;
        item.used = true;
        item.node.active = false;
        ctx.showTutorial(item.type, ITEM_TUTORIALS[item.type]);

        switch (item.type) {
            case 'butterfly':
                ctx.setButterfly(10);
                break;
            case 'firefly':
                ctx.setFirefly(10);
                break;
            case 'wine':
                ctx.setWine(10);
                break;
            case 'catStrip':
                ctx.setCatStrip(10);
                break;
            case 'sewer':
                ctx.teleport();
                break;
            case 'fish':
                if (!ctx.isTimerStopped()) ctx.addTime(20);
                break;
            case 'yarn':
                ctx.setYarn(15);
                break;
            case 'feather':
                if (!ctx.isTimerStopped()) ctx.addTime(-10);
                break;
        }
        ctx.refreshAll();
    }
}
