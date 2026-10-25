import { Node, Sprite, SpriteFrame } from 'cc';
import { CatDir, CatFrames } from './ArtAssets';
import { Dir } from './MazeGenerator';

const DIR_TO_CAT: CatDir[] = ['up', 'right', 'down', 'left'];
const FRAME_TIME = 0.12;

/**
 * Four-direction placeholder walk animation.
 * It owns only presentation; PlayerController remains the source of grid position.
 */
export class CatView {
    private readonly sprite: Sprite;
    private direction: Dir = 2;
    private moving = false;
    private frame = 0;
    private timer = 0;

    constructor(node: Node, private readonly frames: CatFrames) {
        this.sprite = node.getComponent(Sprite) || node.addComponent(Sprite);
        this.sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        this.sprite.type = Sprite.Type.SIMPLE;
        this.sprite.trim = false;
        this.sprite.spriteFrame = frames.down[0];
        this.apply();
    }

    setDirection(dir: Dir): void {
        if (this.direction === dir) return;
        this.direction = dir;
        this.frame = 0;
        this.timer = 0;
        this.apply();
    }

    setMoving(moving: boolean): void {
        if (this.moving === moving) return;
        this.moving = moving;
        if (!moving) {
            this.frame = 0;
            this.timer = 0;
            this.apply();
        }
    }

    update(dt: number): void {
        if (!this.moving) return;
        this.timer += dt;
        if (this.timer < FRAME_TIME) return;
        this.timer = 0;
        const count = this.frames[DIR_TO_CAT[this.direction]].length;
        this.frame = (this.frame + 1) % Math.max(1, count);
        this.apply();
    }

    private apply(): void {
        const list = this.frames[DIR_TO_CAT[this.direction]];
        const frame = list[this.frame % list.length];
        if (frame) this.sprite.spriteFrame = frame;
    }
}
