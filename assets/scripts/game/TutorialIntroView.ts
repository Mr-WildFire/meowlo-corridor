import { Color, EventMouse, EventTouch, Graphics, Node, resources, Sprite, SpriteFrame, sys, UITransform, VideoClip, VideoPlayer } from 'cc';
import { locale } from '../core/Locale';
import { Theme, addLabel, makeNode } from './UiKit';
import { UiFonts } from './UiFonts';

/**
 * Full-screen tutorial movie. The clip is followed directly by the tutorial
 * level. A poster + tap-to-play layer keeps the flow usable on web builds
 * where autoplay with audio is blocked.
 */
export class TutorialIntroView {
    private readonly root: Node;
    private video: VideoPlayer | null = null;
    private videoNode: Node | null = null;
    private playOverlay: Node | null = null;
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

        // Create the video node before the overlay so the overlay stays on top.
        this.videoNode = makeNode('TutorialVideo', this.root, 0, 0, screenW, screenH);
        this.playOverlay = this.createPlayOverlay();

        resources.load('video/tutorial_intro', VideoClip, (err, clip) => {
            if (err || !clip || !this.root.isValid) {
                console.warn('[TutorialIntro] video load failed', err);
                this.showFallback();
                return;
            }

            const vp = this.videoNode!.addComponent(VideoPlayer);
            this.video = vp;
            vp.resourceType = VideoPlayer.ResourceType.LOCAL;
            vp.clip = clip;
            vp.playOnAwake = false;
            vp.loop = false;
            // Browsers block unmuted autoplay; start muted on web so the
            // intro always plays, then keep the overlay for unmuted replay.
            vp.mute = sys.isBrowser;
            vp.volume = 1;
            vp.fullScreenOnPlaying = false;
            vp.stayOnTop = false;
            vp.node.on(VideoPlayer.EventType.PLAYING, () => {
                if (this.playOverlay?.isValid) this.playOverlay.active = false;
            }, this);
            vp.node.on(VideoPlayer.EventType.CLICKED, () => { vp.mute = false; }, this);
            vp.node.on(VideoPlayer.EventType.COMPLETED, () => this.finish(), this);
            vp.node.on(VideoPlayer.EventType.ERROR, () => this.showFallback(), this);
            vp.play();
        });
    }

    private createPlayOverlay(): Node {
        const overlay = makeNode('TutorialPlayOverlay', this.root, 0, 0, this.screenW, this.screenH);
        const g = overlay.addComponent(Graphics);
        g.fillColor = new Color(3, 2, 7, 60);
        g.rect(-this.screenW * 0.5, -this.screenH * 0.5, this.screenW, this.screenH);
        g.fill();
        const play = makeNode('TutorialPlay', overlay, 0, 30, 88, 88);
        const pg = play.addComponent(Graphics);
        pg.fillColor = new Color(216, 178, 122, 35);
        pg.circle(0, 0, 44);
        pg.fill();
        pg.strokeColor = Theme.amber;
        pg.lineWidth = 2;
        pg.circle(0, 0, 44);
        pg.stroke();
        pg.fillColor = Theme.cream;
        pg.moveTo(-10, -17);
        pg.lineTo(19, 0);
        pg.lineTo(-10, 17);
        pg.close();
        pg.fill();
        addLabel(overlay, 'PlayHint', locale.t('tutorial.tapToPlay'), 20, Theme.cream, 0, -70, 500, 40);

        const skip = makeNode('TutorialSkip', overlay, this.screenW * 0.5 - 110, -this.screenH * 0.5 + 62, 180, 52);
        const sg = skip.addComponent(Graphics);
        sg.fillColor = new Color(12, 9, 18, 190);
        sg.strokeColor = new Color(216, 178, 122, 100);
        sg.lineWidth = 1;
        sg.roundRect(-90, -26, 180, 52, 14);
        sg.fill();
        sg.stroke();
        addLabel(skip, 'SkipLabel', locale.t('tutorial.skip'), 17, Theme.dim, 0, 0, 170, 46);
        skip.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            this.finish();
        }, this);

        overlay.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            if (!this.video) return;
            event.propagationStopped = true;
            this.video.play();
        }, this);
        return overlay;
    }

    private finish(): void {
        if (this.started) return;
        this.started = true;
        this.onStart();
    }

    private showFallback(): void {
        if (this.started || !this.root.isValid) return;
        if (this.video?.node.isValid) this.video.node.destroy();
        this.video = null;
        if (this.playOverlay?.isValid) this.playOverlay.destroy();
        this.playOverlay = null;

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
        if (this.video) {
            this.video.stop();
            this.video = null;
        }
        if (this.root?.isValid) this.root.destroy();
    }
}