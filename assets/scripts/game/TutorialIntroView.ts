import { Color, EventMouse, EventTouch, Graphics, Node, Rect, resources, Size, Sprite, SpriteFrame, sys, Texture2D, UITransform, Vec3, VideoClip } from 'cc';
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
    private webOverlay: HTMLElement | null = null;
    private webResize: (() => void) | null = null;

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

        const storyBg = makeNode('TutorialStoryBg', this.root, 0, -350, 1200, 110);
        const sb = storyBg.addComponent(Graphics);
        sb.fillColor = new Color(3, 2, 7, 175);
        sb.roundRect(-600, -55, 1200, 110, 18);
        sb.fill();
        const story = addLabel(
            this.root,
            'TutorialStory',
            locale.t('tutorial.body'),
            21,
            Theme.cream,
            0,
            -350,
            1120,
            96,
        );
        UiFonts.titleLabel(story);

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
        const skipHit = makeNode('TutorialSkipHit', this.root, screenW * 0.5 - 300, -screenH * 0.5 + 62, 200, 60);
        const shg = skipHit.addComponent(Graphics);
        shg.fillColor = new Color(0, 0, 0, 1);
        shg.rect(-100, -30, 200, 60);
        shg.fill();
        const skipPress = (event: EventTouch | EventMouse): void => {
            event.propagationStopped = true;
            this.finish();
        };
        skipHit.on(Node.EventType.TOUCH_END, skipPress, this);
        skipHit.on(Node.EventType.MOUSE_UP, skipPress, this);
        this.root.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            const local = this.root.getComponent(UITransform)!.convertToNodeSpaceAR(
                new Vec3(event.getUILocation().x, event.getUILocation().y, 0),
            );
            if (Math.abs(local.x - (this.screenW * 0.5 - 300)) <= 90 &&
                Math.abs(local.y - (-this.screenH * 0.5 + 62)) <= 26) {
                event.propagationStopped = true;
                this.finish();
            }
        }, this);

        if (!this.tryWebVideo()) this.loadFrames();
    }

    /**
     * Browsers can decode the original MP4 directly. Use a DOM video overlay
     * on web; native keeps the sprite-sheet fallback.
     */
    private tryWebVideo(): boolean {
        if (!sys.isBrowser || typeof document === 'undefined') return false;
        resources.load('video/tutorial_intro', VideoClip, (err, clip) => {
            if (err || !clip || !clip.nativeUrl || !this.root.isValid) {
                this.loadFrames();
                return;
            }
            this.showWebVideo(clip.nativeUrl);
        });
        return true;
    }

    private showWebVideo(url: string): void {
        const canvas = document.querySelector('canvas');
        if (!canvas) {
            this.loadFrames();
            return;
        }
        const host = document.createElement('div');
        host.style.position = 'fixed';
        host.style.zIndex = '9999';
        host.style.background = '#030207';
        host.style.overflow = 'hidden';
        const video = document.createElement('video');
        video.src = url;
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        video.loop = false;
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'contain';
        video.style.background = '#030207';
        video.onended = () => this.finish();
        video.onerror = () => {
            this.removeWebVideo();
            this.loadFrames();
        };
        host.appendChild(video);

        const story = document.createElement('div');
        story.textContent = locale.t('tutorial.body');
        story.style.position = 'absolute';
        story.style.left = '8%';
        story.style.right = '8%';
        story.style.bottom = '8%';
        story.style.padding = '14px 24px';
        story.style.borderRadius = '18px';
        story.style.background = 'rgba(3,2,7,0.72)';
        story.style.color = '#f3e7d3';
        story.style.fontFamily = 'sans-serif';
        story.style.fontSize = 'clamp(16px, 1.8vw, 30px)';
        story.style.textAlign = 'center';
        story.style.lineHeight = '1.4';
        host.appendChild(story);

        const skip = document.createElement('button');
        skip.textContent = locale.t('tutorial.skip');
        skip.style.position = 'absolute';
        skip.style.right = '3%';
        skip.style.bottom = '2%';
        skip.style.padding = '10px 22px';
        skip.style.border = '1px solid rgba(216,178,122,0.7)';
        skip.style.borderRadius = '12px';
        skip.style.background = 'rgba(12,9,18,0.9)';
        skip.style.color = '#f3e7d3';
        skip.style.fontSize = 'clamp(14px, 1.2vw, 22px)';
        skip.style.cursor = 'pointer';
        skip.onclick = () => this.finish();
        host.appendChild(skip);

        const place = (): void => {
            const r = canvas.getBoundingClientRect();
            host.style.left = `${r.left}px`;
            host.style.top = `${r.top}px`;
            host.style.width = `${r.width}px`;
            host.style.height = `${r.height}px`;
        };
        place();
        this.webResize = place;
        window.addEventListener('resize', place);
        document.body.appendChild(host);
        this.webOverlay = host;
        void video.play().catch(() => {
            video.controls = true;
        });
    }

    private removeWebVideo(): void {
        if (this.webResize) {
            window.removeEventListener('resize', this.webResize);
            this.webResize = null;
        }
        this.webOverlay?.remove();
        this.webOverlay = null;
    }

    private loadFrames(): void {
        // One texture instead of 101 separate resource loads. On native this
        // removes the long black/loading gap before the first frame appears.
        resources.load('art/ui/tutorial_sheet/texture', Texture2D, (err, texture) => {
            if (err || !texture || !this.root.isValid) {
                this.showFallback();
                return;
            }
            const total = 101;
            const cellW = 384;
            const cellH = 216;
            const cols = 10;
            const texH = texture.height;
            for (let i = 0; i < total; i++) {
                const frame = new SpriteFrame();
                frame.texture = texture;
                const col = i % cols;
                const row = Math.floor(i / cols);
                frame.rect = new Rect(col * cellW, texH - (row + 1) * cellH, cellW, cellH);
                frame.originalSize = new Size(cellW, cellH);
                this.frames.push(frame);
            }
            this.video.spriteFrame = this.frames[0];
            this.video.node.getComponent(UITransform)!.setContentSize(this.screenW, this.screenH);
            this.applyMotion(0);
            this.timer = setInterval(() => this.tick(), 100);
        });
    }
    private tick(): void {
        if (!this.root.isValid) return;
        this.index++;
        if (this.index >= this.frames.length) {
            this.finish();
            return;
        }
        this.video.spriteFrame = this.frames[this.index];
        this.applyMotion(this.index / Math.max(1, this.frames.length - 1));
    }

    /** The source clip is a slow, nearly static shot; add a gentle push-in
     *  so the intro visibly moves even on small native screens. */
    private applyMotion(t: number): void {
        const scale = 1.03 + t * 0.06;
        this.video.node.setScale(scale, scale, 1);
        this.video.node.setPosition((t - 0.5) * 12, (t - 0.5) * 16, 0);
    }

    private finish(): void {
        if (this.started) return;
        this.started = true;
        if (this.timer !== null) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.removeWebVideo();
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
        this.removeWebVideo();
        this.frames.length = 0;
        if (this.root?.isValid) this.root.destroy();
    }
}


