import { Node, tween, Vec3 } from 'cc';
import { Dir, GridPos } from './MazeGenerator';
import { MazeModel } from './MazeModel';

const MOVE_TIME = 0.1;

/**
 * Grid movement + tween. It does not know about fragments/items/exit;
 * onArrive returns true to stop a multi-cell (cat strip) move.
 */
export class PlayerController {
    position: GridPos;
    steps = 0;
    moving = false;

    constructor(
        public readonly node: Node,
        private readonly model: MazeModel,
        private readonly toLocal: (p: GridPos) => { x: number; y: number },
        private readonly onArrive: (p: GridPos) => boolean,
        private readonly onBlocked: () => void,
    ) {
        this.position = { ...model.data.start };
        this.syncNode();
    }

    async move(dir: Dir, maxSteps: number): Promise<void> {
        if (this.moving) return;
        this.moving = true;

        for (let i = 0; i < maxSteps; i++) {
            const next = this.model.step(this.position, dir);
            if (!next) {
                this.onBlocked();
                break;
            }
            const stop = await this.moveOne(next);
            if (stop) break;
        }

        this.moving = false;
    }

    teleport(pos: GridPos): void {
        this.position = { ...pos };
        this.steps++;
        this.syncNode();
    }

    private moveOne(next: GridPos): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const target = this.toLocal(next);
            tween(this.node)
                .to(MOVE_TIME, { position: new Vec3(target.x, target.y, 0) }, { easing: 'sineOut' })
                .call(() => {
                    this.position = next;
                    this.steps++;
                    resolve(this.onArrive(next));
                })
                .start();
        });
    }

    private syncNode(): void {
        const p = this.toLocal(this.position);
        this.node.setPosition(p.x, p.y, 0);
    }
}
