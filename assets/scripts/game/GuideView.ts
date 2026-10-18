import { Color, Graphics } from 'cc';
import { FragmentView } from './DemoTypes';
import { GridPos } from './MazeGenerator';
import { MazeModel } from './MazeModel';

export interface GuideOptions {
    player: GridPos;
    exit: GridPos | null;
    fragments: FragmentView[];
    yarnActive: boolean;
    butterflyActive: boolean;
    visitedTrail: GridPos[];
    cellToLocal: (p: GridPos) => { x: number; y: number };
    boardH: number;
    cell: number;
}

/**
 * Non-gameplay guidance: yarn trail, exit beam and butterfly path.
 * Drawn above fog and below HUD.
 */
export class GuideView {
    constructor(
        private readonly trailGfx: Graphics,
        private readonly guideGfx: Graphics,
        private readonly model: MazeModel,
    ) {}

    render(opts: GuideOptions): void {
        this.guideGfx.clear();
        this.trailGfx.clear();

        if (opts.yarnActive && opts.visitedTrail.length > 1) {
            this.trailGfx.strokeColor = new Color(201, 106, 122, 150);
            this.trailGfx.lineWidth = 3;
            const first = opts.cellToLocal(opts.visitedTrail[0]);
            this.trailGfx.moveTo(first.x, first.y);
            for (let i = 1; i < opts.visitedTrail.length; i++) {
                const p = opts.cellToLocal(opts.visitedTrail[i]);
                this.trailGfx.lineTo(p.x, p.y);
            }
            this.trailGfx.stroke();
        }

        if (opts.exit) {
            const p = opts.cellToLocal(opts.exit);
            this.guideGfx.strokeColor = new Color(143, 211, 214, 170);
            this.guideGfx.lineWidth = 6;
            this.guideGfx.moveTo(p.x, p.y);
            this.guideGfx.lineTo(p.x, opts.boardH + 100);
            this.guideGfx.stroke();
            this.guideGfx.fillColor = new Color(143, 211, 214, 80);
            this.guideGfx.circle(p.x, p.y, opts.cell * 0.42);
            this.guideGfx.fill();
        }

        const path = opts.butterflyActive ? this.butterflyPath(opts) : [];
        if (path.length > 1) {
            const first = opts.cellToLocal(path[0]);
            this.guideGfx.strokeColor = new Color(143, 211, 214, 210);
            this.guideGfx.lineWidth = 4;
            this.guideGfx.moveTo(first.x, first.y);
            const count = Math.min(4, path.length - 1);
            for (let i = 1; i <= count; i++) {
                const p = opts.cellToLocal(path[i]);
                this.guideGfx.lineTo(p.x, p.y);
                this.guideGfx.circle(p.x, p.y, 4);
            }
            this.guideGfx.stroke();
            this.guideGfx.fillColor = new Color(143, 211, 214, 255);
            this.guideGfx.fill();
        }
    }

    dispose(): void {
        this.trailGfx.clear();
        this.guideGfx.clear();
    }

    private butterflyPath(opts: GuideOptions): GridPos[] {
        let target: GridPos | null = null;
        let best = Number.POSITIVE_INFINITY;

        for (const f of opts.fragments) {
            if (f.collected) continue;
            const d = this.model.distance(opts.player, f.pos);
            if (d < best) {
                best = d;
                target = f.pos;
            }
        }

        if (!target && opts.exit) target = opts.exit;
        if (!target) return [];
        return this.model.path(opts.player, target);
    }
}
