import { Color, EventMouse, EventTouch, Graphics, Node, resources, Sprite, SpriteFrame, UITransform } from 'cc';
import { locale } from '../core/Locale';
import { Theme, addLabel, makeNode } from './UiKit';
import { UiFonts } from './UiFonts';

/**
 * Full-screen tutorial movie.
 *
 * Cocos VideoPlayer is unavailable in the Windows simulator and on some native
 * targets, so the supplied 10-second movie is shipped as a 10fps frame strip.
 * It auto-plays on every platform, then enters the tutorial directly.
 */
export class TutorialIntroView {
    private readonly root: Node;
    private readonly video: Sprite;
    private timer: ReturnType<typeof setInterval> | null = null;
    private frames: SpriteFrame[] = [];
    private index = 0;
    private started = false;

    constructor(
        parent: Node,
        private readonly screenW: number,
        private readonly screenH: number,
        private readonly onStart: () => void,
    ) {
        this.root = makeNode('TutorialIntroRoot', parent, 0, 0, screenW, screenH);
        const bg = this.root.addComponent(Graphics);
        bg.fillColor = new Color(3, 2, 7, 255);
        bg.rect(-screenW * 0.5, -screenH * 0.5, screenW, screenH);
        bg.fill();

        const poster = makeNode('TutorialPoster', this.root, 0, 0, screenW, screenH);
        const ps = poster.addComponent(Sprite);
        ps.sizeMode = Sprite.SizeMode.CUSTOM;
        ps.trim = false;
        resources.load('art/ui/menu_bg/spriteFrame', SpriteFrame, (err, frame) => {
            if (err || !frame || !poster.isValid) return;
            ps.spriteFrame = frame;
            poster.getComponent(UITransform)!.setContentSize(screenW, screenH);
        });

        const videoNode = makeNode('TutorialFrames', this.root, 0, 0, screenW, screenH);
        this.video = videoNode.addComponent(Sprite);
        this.video.sizeMode = Sprite.SizeMode.CUSTOM;
        this.video.trim = false;
        videoNode.getComponent(UITransform)!.setContentSize(screenW, screenH);

        const skip = makeNode('TutorialSkip', this.root, screenW * 0.5 - 300, -screenH * 0.5 + 62, 180, 52);
        const sg = skip.addComponent(Graphics);
        sg.fillColor = new Color(12, 9, 18, 205);
        sg.strokeColor = new Color(216, 178, 122, 130);
        sg.lineWidth = 1;
        sg.roundRect(-90, -26, 180, 52, 14);
        sg.fill();
        sg.stroke();
        addLabel(skip, 'TutorialSkipLabel', locale.t('tutorial.skip'), 17, Theme.cream, 0, 0, 170, 46);
        skip.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            this.finish();
        }, this);

        this.loadFrames();
    }

    private loadFrames(): void {
        const total = 101;
        const loadAt = (index: number): void => {
            if (!this.root.isValid) return;
            if (index >= total) {
                this.video.spriteFrame = this.frames[0];
                this.video.node.getComponent(UITransform)!.setContentSize(this.screenW, this.screenH);
                this.timer = setInterval(() => this.tick(), 100);
                return;
            }
            const name = `frame_${String(index).padStart(3, '0')}`;
            resources.load(`art/ui/tutorial_frames/${name}/spriteFrame`, SpriteFrame, (err, frame) => {
                if (err || !frame) {
                    this.showFallback();
                    return;
                }
                this.frames.push(frame);
                if (index === 0) this.video.spriteFrame = frame;
                loadAt(index + 1);
            });
        };
        loadAt(0);
    }
    private tick(): void {
        if (!this.root.isValid) return;
        this.index++;
        if (this.index >= this.frames.length) {
            this.finish();
            return;
        }
        this.video.spriteFrame = this.frames[this.index];
    }

    private finish(): void {
        if (this.started) return;
        this.started = true;
        if (this.timer !== null) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.onStart();
    }

    private showFallback(): void {
        if (this.started || !this.root.isValid) return;
        this.video.node.active = false;
        const title = addLabel(this.root, 'TutorialTitle', locale.t('tutorial.title'), 44, Theme.cream, 0, 220, 900, 70);
        UiFonts.titleLabel(title);
        addLabel(this.root, 'TutorialBody', locale.t('tutorial.body'), 22, Theme.cream, 0, 110, 1100, 80);
        const button = makeNode('TutorialStart', this.root, 0, -150, 380, 68);
        const g = button.addComponent(Graphics);
        g.fillColor = new Color(42, 31, 54, 250);
        g.strokeColor = new Color(216, 178, 122, 210);
        g.lineWidth = 2;
        g.roundRect(-190, -34, 380, 68, 16);
        g.fill();
        g.stroke();
        addLabel(button, 'TutorialStartLabel', locale.t('tutorial.start'), 23, Theme.cream, 0, 0, 360, 60);
        const press = (event: EventTouch | EventMouse): void => {
            event.propagationStopped = true;
            this.finish();
        };
        button.on(Node.EventType.TOUCH_END, press, this);
        button.on(Node.EventType.MOUSE_UP, press, this);
    }

    dispose(): void {
        if (this.timer !== null) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.frames.length = 0;
        if (this.root?.isValid) this.root.destroy();
    }
}

