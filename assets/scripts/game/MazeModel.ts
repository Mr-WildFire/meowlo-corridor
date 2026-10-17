import { Rng } from '../core/Rng';
import {
    bfs,
    canMove,
    deadEnds,
    DIRS,
    GridPos,
    keyOf,
    MazeData,
    pathTo,
    step,
} from './MazeGenerator';

export class MazeModel {
    constructor(public readonly data: MazeData) {}

    canMove(p: GridPos, dir: 0 | 1 | 2 | 3): boolean {
        return canMove(this.data, p, dir);
    }

    step(p: GridPos, dir: 0 | 1 | 2 | 3): GridPos | null {
        return step(this.data, p, dir);
    }

    neighbors(p: GridPos): GridPos[] {
        const out: GridPos[] = [];
        for (let d = 0; d < 4; d++) {
            if (!this.canMove(p, d as 0 | 1 | 2 | 3)) continue;
            out.push({ x: p.x + DIRS[d].dx, y: p.y + DIRS[d].dy });
        }
        return out;
    }

    bfs(from: GridPos): Map<number, number> {
        return bfs(this.data, from);
    }

    path(from: GridPos, to: GridPos): GridPos[] {
        return pathTo(this.data, from, to);
    }

    distance(from: GridPos, to: GridPos): number {
        return this.bfs(from).get(keyOf(this.data.cols, to)) ?? Number.POSITIVE_INFINITY;
    }

    deadEnds(): GridPos[] {
        return deadEnds(this.data);
    }

    randomCell(rng: Rng, accept?: (p: GridPos) => boolean): GridPos | null {
        const candidates: GridPos[] = [];
        for (let y = 0; y < this.data.rows; y++) {
            for (let x = 0; x < this.data.cols; x++) {
                const p = { x, y };
                if (!accept || accept(p)) candidates.push(p);
            }
        }
        if (candidates.length === 0) return null;
        return rng.pick(candidates);
    }
}
