import { Color, EventMouse, EventTouch, Graphics, Label, Node, Sprite, SpriteFrame, UITransform } from 'cc';
import { locale } from '../core/Locale';
import { ItemType } from './DemoTypes';
import { ITEM_META } from './ItemSystem';
import { Dir } from './MazeGenerator';
import { Theme, addLabel, makeNode, timeText } from './UiKit';

export interface HudCallbacks {
    onDirection(dir: Dir): void;
    onPause(): void;
    onMute(): void;
    onSettings(): void;
}

export interface HudStats {
    collected: number;
    total: number;
    exitOpen: boolean;
    timeLeft: number;
    elapsed: number;
    steps: number;
    effects: string;
    timerStopped: boolean;
    seed: number;
    cols: number;
    rows: number;
    levelLabel: string;
    timeLimit: number;
}

/**
 * HUD + overlay + touch controls. All game decisions are delegated through callbacks.
 */
export class HudView {
    private readonly root: Node;
    private readonly hudLabel: Label;
    private readonly timerLabel: Label;
    private readonly stepLabel: Label;
    private readonly effectLabel: Label;
    private readonly seedLabel: Label;
    private readonly toastNode: Node;
    private readonly toastLabel: Label;
    private readonly tutorialNode: Node;
    private readonly tutorialIcon: Label;
    private readonly tutorialTitle: Label;
    private readonly tutorialBody: Label;
    private tutorialToken = 0;
    private readonly overlayRoot: Node;
    private readonly overlayTitle: Label;
    private readonly overlayBody: Label;
    private readonly overlayHint: Label;
    private readonly overlayArt: Sprite;
    private muteLabel!: Label;
    private toastToken = 0;

    constructor(
        parent: Node,
        private readonly screenW: number,
        private readonly screenH: number,
        private readonly safeTop: number,
        private readonly safeBottom: number,
        private readonly safeLeft: number,
        private readonly safeRight: number,
        private readonly callbacks: HudCallbacks,
        private readonly scheduleOnce: (cb: () => void, delay: number) => void,
    ) {
        this.root = makeNode('HudRoot', parent, 0, 0, screenW, screenH);
        const top = screenH * 0.5 - safeTop;
        const bottom = -screenH * 0.5 + safeBottom;

        addLabel(this.root, 'Title', locale.t('hud.title'), 32, Theme.cream, 0, top - 45, 980, 60);
        this.hudLabel = addLabel(
            this.root,
            'HudTrack',
            locale.t('hud.track', { n: 0, total: 4 }),
            26,
            Theme.cream,
            0,
            top - 100,
            1000,
            50,
        );
        this.timerLabel = addLabel(this.root, 'HudTimer', '07:00', 32, Theme.cream, 0, top - 145, 900, 55);
        this.stepLabel = addLabel(
            this.root,
            'HudSteps',
            locale.t('hud.steps', { steps: 0, time: '00:00' }),
            19,
            Theme.dim,
            0,
            top - 185,
            900,
            40,
        );
        this.effectLabel = addLabel(this.root, 'HudEffects', locale.t('hud.none'), 17, Theme.mint, 0, top - 218, 1000, 40);
        this.seedLabel = addLabel(this.root, 'HudSeed', '', 13, Theme.dim, 0, top - 248, 1000, 30);

        addLabel(
            this.root,
            'Help',
            locale.t('hud.help'),
            15,
            Theme.dim,
            0,
            bottom + 42,
            1040,
            34,
        );

        this.toastNode = makeNode('Toast', this.root, 0, bottom + 125, 980, 50);
        this.toastLabel = addLabel(this.toastNode, 'ToastLabel', '', 21, Theme.cream, 0, 0, 960, 50);
        this.toastNode.active = false;

        this.tutorialNode = makeNode('Tutorial', this.root, 0, bottom + 430, 760, 120);
        const tutorialBg = this.tutorialNode.addComponent(Graphics);
        tutorialBg.fillColor = new Color(30, 23, 40, 245);
        tutorialBg.strokeColor = new Color(216, 178, 122, 200);
        tutorialBg.lineWidth = 2;
        tutorialBg.roundRect(-380, -60, 760, 120, 18);
        tutorialBg.fill();
        tutorialBg.stroke();

        const iconNode = makeNode('TutorialIcon', this.tutorialNode, -310, 0, 72, 72);
        const iconG = iconNode.addComponent(Graphics);
        iconG.fillColor = new Color(242, 179, 92, 70);
        iconG.circle(0, 0, 34);
        iconG.fill();
        iconG.strokeColor = Theme.amber;
        iconG.lineWidth = 2;
        iconG.circle(0, 0, 34);
        iconG.stroke();
        this.tutorialIcon = addLabel(iconNode, 'TutorialIconLabel', '?', 22, Theme.cream, 0, 0, 72, 72);
        this.tutorialTitle = addLabel(this.tutorialNode, 'TutorialTitle', '', 19, Theme.cream, -100, 25, 500, 34);
        this.tutorialBody = addLabel(this.tutorialNode, 'TutorialBody', '', 15, Theme.dim, -100, -20, 500, 34);
        this.tutorialNode.active = false;

        this.createControls();

        this.overlayRoot = makeNode('Overlay', this.root, 0, 0, screenW, screenH);
        const overlayBg = this.overlayRoot.addComponent(Graphics);
        overlayBg.fillColor = new Color(4, 3, 8, 220);
        overlayBg.rect(-screenW * 0.5, -screenH * 0.5, screenW, screenH);
        overlayBg.fill();

        const artNode = makeNode('OverlayArt', this.overlayRoot, 0, 300, 240, 240);
        this.overlayArt = artNode.addComponent(Sprite);
        this.overlayArt.sizeMode = Sprite.SizeMode.CUSTOM;
        this.overlayArt.trim = false;
        artNode.active = false;

        this.overlayTitle = addLabel(this.overlayRoot, 'OverlayTitle', '', 46, Theme.cream, 0, 110, 980, 80);
        this.overlayBody = addLabel(this.overlayRoot, 'OverlayBody', '', 24, Theme.cream, 0, 20, 980, 80);
        this.overlayHint = addLabel(this.overlayRoot, 'OverlayHint', '', 18, Theme.dim, 0, -70, 980, 60);
        this.overlayRoot.active = false;
    }

    setStats(stats: HudStats): void {
        this.hudLabel.string = locale.t(stats.exitOpen ? 'hud.trackOpen' : 'hud.track', {
            n: stats.collected,
            total: stats.total,
        });

        this.timerLabel.string = stats.timerStopped
            ? locale.t('hud.musicComplete')
            : locale.t('hud.timeLeft', { time: timeText(stats.timeLeft) });
        this.timerLabel.color = stats.timerStopped
            ? Theme.cyan
            : stats.timeLeft <= 30
              ? Theme.rose
              : stats.timeLeft <= 60
                ? Theme.amber
                : Theme.cream;

        this.stepLabel.string = locale.t('hud.steps', { steps: stats.steps, time: timeText(stats.elapsed) });
        this.effectLabel.string = stats.effects;
        this.seedLabel.string = locale.t('hud.seed', {
            seed: stats.seed,
            level: stats.levelLabel,
            cols: stats.cols,
            rows: stats.rows,
            time: timeText(stats.timeLimit),
        });
    }

    toast(text: string, duration = 2): void {
        this.toastToken++;
        const token = this.toastToken;
        this.toastLabel.string = text;
        this.toastNode.active = true;
        this.scheduleOnce(() => {
            if (token === this.toastToken) this.toastNode.active = false;
        }, duration);
    }

    showTutorial(type: ItemType, text: string): void {
        const meta = ITEM_META[type];
        this.tutorialToken++;
        const token = this.tutorialToken;
        this.tutorialIcon.string = locale.itemShort(type);
        this.tutorialIcon.color = meta.color;
        this.tutorialTitle.string = locale.t('hud.tutorial', { name: locale.itemName(type) });
        this.tutorialBody.string = text;
        this.tutorialNode.active = true;
        this.scheduleOnce(() => {
            if (token === this.tutorialToken) this.tutorialNode.active = false;
        }, 2.8);
    }

    showOverlay(title: string, body: string, hint: string, art: SpriteFrame | null = null): void {
        this.overlayTitle.string = title;
        this.overlayBody.string = body;
        this.overlayHint.string = hint;
        this.setOverlayArt(art);
        this.overlayRoot.active = true;
    }

    setOverlayArt(frame: SpriteFrame | null): void {
        const node = this.overlayArt.node;
        if (!frame) {
            node.active = false;
            return;
        }
        this.overlayArt.spriteFrame = frame;
        node.getComponent(UITransform)!.setContentSize(240, 240);
        node.active = true;
    }

    hideOverlay(): void {
        this.overlayRoot.active = false;
    }

    setMuted(muted: boolean): void {
        if (!this.muteLabel) return;
        this.muteLabel.string = muted ? locale.t('hud.mute') : locale.t('hud.sound');
        this.muteLabel.color = muted ? Theme.rose : Theme.cream;
    }

    dispose(): void {
        this.toastToken++;
        this.tutorialToken++;
    }

    private createControls(): void {
        const size = 64;
        const gap = 8;
        const baseX = this.screenW * 0.5 - this.safeRight - 190;
        // Tall phones need a larger bottom reserve; otherwise the down arrow
        // and help line fall below the visible viewport.
        const baseY = -this.screenH * 0.5 + this.safeBottom + 260;

        this.createDirectionButton(0, '↑', baseX, baseY + size + gap, size);
        this.createDirectionButton(2, '↓', baseX, baseY - size - gap, size);
        this.createDirectionButton(3, '←', baseX - size - gap, baseY, size);
        this.createDirectionButton(1, '→', baseX + size + gap, baseY, size);

        const controlY = this.screenH * 0.5 - this.safeTop - 78;
        const pause = makeNode('PauseButton', this.root, -this.screenW * 0.5 + this.safeLeft + 110, controlY, 54, 54);
        const pg = pause.addComponent(Graphics);
        pg.fillColor = new Color(40, 31, 54, 220);
        pg.strokeColor = new Color(170, 158, 145, 180);
        pg.lineWidth = 2;
        pg.roundRect(-27, -27, 54, 54, 14);
        pg.fill();
        pg.stroke();
        addLabel(pause, 'PauseLabel', 'II', 20, Theme.cream, 0, 0, 54, 54);

        const pausePress = (event: EventTouch | EventMouse): void => {
            event.propagationStopped = true;
            this.callbacks.onPause();
        };
        pause.on(Node.EventType.TOUCH_END, pausePress, this);
        pause.on(Node.EventType.MOUSE_UP, pausePress, this);

        const mute = makeNode('MuteButton', this.root, this.screenW * 0.5 - this.safeRight - 110, controlY, 54, 54);
        const mg = mute.addComponent(Graphics);
        mg.fillColor = new Color(40, 31, 54, 220);
        mg.strokeColor = new Color(170, 158, 145, 180);
        mg.lineWidth = 2;
        mg.roundRect(-27, -27, 54, 54, 14);
        mg.fill();
        mg.stroke();
        this.muteLabel = addLabel(mute, 'MuteLabel', locale.t('hud.sound'), 18, Theme.cream, 0, 0, 54, 54);

        const mutePress = (event: EventTouch | EventMouse): void => {
            event.propagationStopped = true;
            this.callbacks.onMute();
        };
        mute.on(Node.EventType.TOUCH_END, mutePress, this);
        mute.on(Node.EventType.MOUSE_UP, mutePress, this);

        const settings = makeNode('SettingsButton', this.root, this.screenW * 0.5 - this.safeRight - 176, controlY, 54, 54);
        const sg = settings.addComponent(Graphics);
        sg.fillColor = new Color(40, 31, 54, 220);
        sg.strokeColor = new Color(170, 158, 145, 180);
        sg.lineWidth = 2;
        sg.roundRect(-27, -27, 54, 54, 14);
        sg.fill();
        sg.stroke();
        addLabel(settings, 'SettingsLabel', locale.t('hud.settings'), 16, Theme.cream, 0, 0, 54, 54);

        const settingsPress = (event: EventTouch | EventMouse): void => {
            event.propagationStopped = true;
            this.callbacks.onSettings();
        };
        settings.on(Node.EventType.TOUCH_END, settingsPress, this);
        settings.on(Node.EventType.MOUSE_UP, settingsPress, this);
    }

    private createDirectionButton(dir: Dir, text: string, x: number, y: number, size: number): void {
        const node = makeNode('Dpad_' + text, this.root, x, y, size, size);
        const g = node.addComponent(Graphics);
        g.fillColor = new Color(45, 35, 58, 220);
        g.strokeColor = new Color(216, 178, 122, 180);
        g.lineWidth = 2;
        g.roundRect(-size * 0.5, -size * 0.5, size, size, 14);
        g.fill();
        g.stroke();
        addLabel(node, 'DpadLabel', text, 28, Theme.cream, 0, 0, size, size);

        const press = (event: EventTouch | EventMouse): void => {
            event.propagationStopped = true;
            this.callbacks.onDirection(dir);
        };
        node.on(Node.EventType.TOUCH_END, press, this);
        node.on(Node.EventType.MOUSE_UP, press, this);
    }
}
