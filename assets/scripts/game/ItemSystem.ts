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
    refreshAll(): void;
}

/**
 * Item placement + effect dispatch.
 * View creation is injected so the system stays independent of the renderer.
 */
export class ItemSystem {
    place(
        model: MazeModel,
        rng: Rng,
        occupied: Set<string>,
        createNode: (type: ItemType, pos: GridPos) => Node,
    ): ItemView[] {
        const types: ItemType[] = [
            'butterfly',
            'firefly',
            'wine',
            'catStrip',
            'sewer',
            'sewer',
            'fish',
            'yarn',
        ];
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

        switch (item.type) {
            case 'butterfly':
                ctx.setButterfly(10);
                ctx.toast('蝴蝶：跟着我，十步。');
                break;
            case 'firefly':
                ctx.setFirefly(10);
                ctx.toast('萤火虫：视野扩大到 4 格，10 秒。');
                break;
            case 'wine':
                ctx.setWine(10);
                ctx.toast('鲜花酒：方向颠倒 10 秒。');
                break;
            case 'catStrip':
                ctx.setCatStrip(10);
                ctx.toast('猫条：每次移动 2 格，10 秒。');
                break;
            case 'sewer':
                ctx.teleport();
                break;
            case 'fish':
                if (!ctx.isTimerStopped()) {
                    ctx.addTime(20);
                    ctx.toast('小鱼干：时间 +20 秒。');
                }
                break;
            case 'yarn':
                ctx.setYarn(15);
                ctx.toast('毛线球：记住走过的路，15 秒。');
                break;
            case 'feather':
                if (!ctx.isTimerStopped()) {
                    ctx.addTime(-10);
                    ctx.toast('蝙蝠黑羽：时间 -10 秒。');
                }
                break;
        }
        ctx.refreshAll();
    }
}
