import { Color, EventMouse, EventTouch, Graphics, Node, resources, Sprite, SpriteFrame, UITransform } from 'cc';
import { locale } from '../core/Locale';
import { Theme, addLabel, makeNode } from './UiKit';
import { UiFonts } from './UiFonts';

/**
 * First-run / settings tutorial intro.
 * The 960x540 center is reserved for the future VideoPlayer; until the video
 * asset is supplied it shows a labelled poster placeholder.
 */
export class TutorialIntroView {
    private readonly root: Node;

    constructor(
        parent: Node,
        private readonly screenW: number,
        private readonly screenH: number,
        private readonly onStart: () => void,
    ) {
        this.root = makeNode('TutorialIntroRoot', parent, 0, 0, screenW, screenH);
        const dim = this.root.addComponent(Graphics);
        dim.fillColor = new Color(4, 3, 8, 245);
        dim.rect(-screenW * 0.5, -screenH * 0.5, screenW, screenH);
        dim.fill();

        const poster = makeNode('TutorialPoster', this.root, 0, 0, screenW, screenH);
        const ps = poster.addComponent(Sprite);
        ps.sizeMode = Sprite.SizeMode.CUSTOM;
        ps.trim = false;
        resources.load('art/ui/menu_bg/spriteFrame', SpriteFrame, (err, frame) => {
            if (err || !frame || !poster.isValid) return;
            ps.spriteFrame = frame;
            poster.getComponent(UITransform)!.setContentSize(screenW, screenH);
        });
        const shadeNode = makeNode('TutorialShade', this.root, 0, 0, screenW, screenH);
        const shade = shadeNode.addComponent(Graphics);
        shade.fillColor = new Color(4, 3, 8, 150);
        shade.rect(-screenW * 0.5, -screenH * 0.5, screenW, screenH);
        shade.fill();

        const title = addLabel(this.root, 'TutorialTitle', locale.t('tutorial.title'), 46, Theme.cream, 0, 390, 900, 70);
        UiFonts.titleLabel(title);
        addLabel(this.root, 'TutorialKicker', 'INTRO', 16, Theme.cyan, 0, 440, 400, 30);
        addLabel(this.root, 'TutorialBody', locale.t('tutorial.body'), 21, Theme.dim, 0, 325, 1000, 60);

        const video = makeNode('TutorialVideoSlot', this.root, 0, 20, 960, 440);
        const vg = video.addComponent(Graphics);
        vg.fillColor = new Color(10, 7, 16, 235);
        vg.strokeColor = new Color(216, 178, 122, 130);
        vg.lineWidth = 2;
        vg.roundRect(-480, -220, 960, 440, 18);
        vg.fill();
        vg.stroke();
        const play = makeNode('TutorialPlay', video, 0, 45, 76, 76);
        const pg = play.addComponent(Graphics);
        pg.fillColor = new Color(216, 178, 122, 30);
        pg.circle(0, 0, 38);
        pg.fill();
        pg.strokeColor = Theme.amber;
        pg.lineWidth = 2;
        pg.circle(0, 0, 38);
        pg.stroke();
        pg.fillColor = Theme.cream;
        pg.moveTo(-9, -14);
        pg.lineTo(16, 0);
        pg.lineTo(-9, 14);
        pg.close();
        pg.fill();
        addLabel(video, 'TutorialVideoText', locale.t('tutorial.video'), 18, Theme.dim, 0, -105, 860, 36);

        const button = makeNode('TutorialStart', this.root, 0, -360, 380, 68);
        const bg = button.addComponent(Graphics);
        bg.fillColor = new Color(42, 31, 54, 250);
        bg.strokeColor = new Color(216, 178, 122, 210);
        bg.lineWidth = 2;
        bg.roundRect(-190, -34, 380, 68, 16);
        bg.fill();
        bg.stroke();
        addLabel(button, 'TutorialStartLabel', locale.t('tutorial.start'), 23, Theme.cream, 0, 0, 360, 60);
        const press = (event: EventTouch | EventMouse): void => {
            event.propagationStopped = true;
            this.onStart();
        };
        button.on(Node.EventType.TOUCH_END, press, this);
        button.on(Node.EventType.MOUSE_UP, press, this);
    }

    dispose(): void {
        if (this.root?.isValid) this.root.destroy();
    }
}