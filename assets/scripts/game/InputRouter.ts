import {
    EventKeyboard,
    EventMouse,
    EventTouch,
    Input,
    input,
    KeyCode,
    Vec2,
} from 'cc';
import { Difficulty } from './LevelConfig';
import { Dir } from './MazeGenerator';

export interface InputCallbacks {
    onDirection(dir: Dir): void;
    onPause(): void;
    onMute(): void;
    onSettings(): void;
    onRestart(): void;
    onMenu(): void;
    onDifficulty(difficulty: Difficulty): void;
    onDebugCollect(): void;
    onDebugTime(): void;
    onTap(x: number, y: number): void;
}

/**
 * Owns keyboard/touch/mouse listeners; game state decisions stay in DemoGame.
 */
export class InputRouter {
    private touchStart: Vec2 | null = null;

    constructor(private readonly callbacks: InputCallbacks) {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    }

    dispose(): void {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        this.touchStart = null;
    }

    private onKeyDown(event: EventKeyboard): void {
        const key = event.keyCode;

        if (key === KeyCode.KEY_R) {
            this.callbacks.onRestart();
        } else if (key === KeyCode.KEY_P) {
            this.callbacks.onPause();
        } else if (key === KeyCode.KEY_V) {
            this.callbacks.onMute();
        } else if (key === KeyCode.KEY_O) {
            this.callbacks.onSettings();
        } else if (key === KeyCode.KEY_M) {
            this.callbacks.onMenu();
        } else if (key === KeyCode.KEY_C) {
            this.callbacks.onDebugCollect();
        } else if (key === KeyCode.KEY_T) {
            this.callbacks.onDebugTime();
        } else if (key === KeyCode.DIGIT_1 || key === KeyCode.NUM_1) {
            this.callbacks.onDifficulty('easy');
        } else if (key === KeyCode.DIGIT_2 || key === KeyCode.NUM_2) {
            this.callbacks.onDifficulty('normal');
        } else if (key === KeyCode.DIGIT_3 || key === KeyCode.NUM_3) {
            this.callbacks.onDifficulty('hard');
        } else if (key === KeyCode.ARROW_UP || key === KeyCode.KEY_W) {
            this.callbacks.onDirection(0);
        } else if (key === KeyCode.ARROW_RIGHT || key === KeyCode.KEY_D) {
            this.callbacks.onDirection(1);
        } else if (key === KeyCode.ARROW_DOWN || key === KeyCode.KEY_S) {
            this.callbacks.onDirection(2);
        } else if (key === KeyCode.ARROW_LEFT || key === KeyCode.KEY_A) {
            this.callbacks.onDirection(3);
        }
    }

    private onTouchStart(event: EventTouch): void {
        this.touchStart = event.getUILocation();
    }

    private onTouchEnd(event: EventTouch): void {
        const start = this.touchStart;
        if (!start) return;
        this.touchStart = null;
        this.handlePointerEnd(start, event.getUILocation());
    }

    private onMouseDown(event: EventMouse): void {
        this.touchStart = event.getUILocation();
    }

    private onMouseUp(event: EventMouse): void {
        const start = this.touchStart;
        if (!start) return;
        this.touchStart = null;
        this.handlePointerEnd(start, event.getUILocation());
    }

    private handlePointerEnd(start: Vec2, end: Vec2): void {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        if (Math.abs(dx) < 30 && Math.abs(dy) < 30) {
            this.callbacks.onTap(end.x, end.y);
            return;
        }
        if (Math.abs(dx) > Math.abs(dy)) {
            this.callbacks.onDirection(dx > 0 ? 1 : 3);
        } else {
            this.callbacks.onDirection(dy > 0 ? 0 : 2);
        }
    }
}
