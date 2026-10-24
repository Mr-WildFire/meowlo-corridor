import {
    Color,
    EventMouse,
    EventTouch,
    Graphics,
    Label,
    Node,
    Sprite,
    SpriteFrame,
    UITransform,
} from 'cc';
import { locale } from '../core/Locale';
import { UiFonts } from './UiFonts';
import { Difficulty } from './LevelConfig';
import { ItemType } from './DemoTypes';
import { addLabel, makeNode, Theme, timeText } from './UiKit';

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

export interface HudCallbacks {
    onMenu(): void;
    onResume(): void;
    onSettings(): void;
    onMute(): void;
    onRestart(): void;
    onDifficulty(difficulty: Difficulty): void;
}

/**
 * Minimal landscape HUD: one fixed top information strip and one menu button.
 * All gameplay movement is swipe/keyboard; there is no on-screen D-pad.
 */
export class HudView {
    private readonly root: Node;
    private readonly trackLabel: Label;
    private readonly timerLabel: Label;
    private readonly stepLabel: Label;
    private readonly seedLabel: Label;
    private readonly toastNode: Node;
    private readonly toastLabel: Label;
    private readonly tutorialNode: Node;
    private readonly tutorialIcon: Label;
    private readonly tutorialTitle: Label;
    private readonly tutorialBody: Label;
    private readonly pauseRoot: Node;
    private readonly pauseMuteLabel: Label;
    private readonly overlayRoot: Node;
    private readonly overlayArt: Sprite;
    private readonly overlayTitle: Label;
    private readonly overlayBody: Label;
    private readonly overlayHint: Label;
    private toastToken = 0;
    private tutorialToken = 0;

    constructor(
        parent: Node,
        private readonly screenW: number,
        private readonly screenH: number,
        private readonly callbacks: HudCallbacks,
        private readonly scheduleOnce: (cb: () => void, delay: number) => void,
    ) {
        this.root = makeNode('HudRoot', parent, 0, 0, screenW, screenH);
        const top = screenH * 0.5;

        // Fixed landscape information strip.
        const bar = makeNode('TopBar', this.root, 0, top - 36, screenW, 72);
        const bg = bar.addComponent(Graphics);
        bg.fillColor = new Color(8, 6, 14, 235);
        bg.rect(-screenW * 0.5, -36, screenW, 72);
        bg.fill();
        bg.strokeColor = new Color(216, 178, 122, 70);
        bg.lineWidth = 1;
        bg.moveTo(-screenW * 0.5, -36);
        bg.lineTo(screenW * 0.5, -36);
        bg.stroke();

        // Keep the strip inside the central 1440px so it also fits 4:3
        // Cocos preview windows, not only a 16:9 device.
        this.trackLabel = addLabel(bar, 'Track', '', 21, Theme.cream, -520, 0, 340, 44);
        addLabel(bar, 'TimeCaption', locale.t('hud.timeCaption'), 17, Theme.dim, -245, 0, 70, 40);
        this.timerLabel = addLabel(bar, 'Timer', '', 30, Theme.amber, -160, 0, 160, 48);
        UiFonts.numberLabel(this.timerLabel);
        this.stepLabel = addLabel(bar, 'Steps', '', 19, Theme.cream, 30, 0, 220, 44);
        this.seedLabel = addLabel(bar, 'Seed', '', 14, Theme.dim, 330, 0, 330, 40);
        this.createButton(bar, 'MenuButton', '≡', 610, 0, 58, 50, () => this.callbacks.onMenu());

        this.toastNode = makeNode('Toast', this.root, 0, -screenH * 0.5 + 88, 980, 48);
        const toastBg = this.toastNode.addComponent(Graphics);
        toastBg.fillColor = new Color(22, 16, 30, 230);
        toastBg.roundRect(-490, -24, 980, 48, 18);
        toastBg.fill();
        this.toastLabel = addLabel(this.toastNode, 'ToastLabel', '', 21, Theme.cream, 0, 0, 950, 44);
        this.toastNode.active = false;

        this.tutorialNode = makeNode('Tutorial', this.root, -500, -screenH * 0.5 + 140, 460, 92);
        const tutorialBg = this.tutorialNode.addComponent(Graphics);
        tutorialBg.fillColor = new Color(30, 23, 40, 245);
        tutorialBg.strokeColor = new Color(216, 178, 122, 200);
        tutorialBg.lineWidth = 2;
        tutorialBg.roundRect(-230, -46, 460, 92, 16);
        tutorialBg.fill();
        tutorialBg.stroke();
        const iconNode = makeNode('TutorialIcon', this.tutorialNode, -190, 0, 58, 58);
        const iconG = iconNode.addComponent(Graphics);
        iconG.fillColor = new Color(242, 179, 92, 60);
        iconG.circle(0, 0, 27);
        iconG.fill();
        iconG.strokeColor = Theme.amber;
        iconG.lineWidth = 2;
        iconG.circle(0, 0, 27);
        iconG.stroke();
        this.tutorialIcon = addLabel(iconNode, 'TutorialIconLabel', '?', 18, Theme.cream, 0, 0, 58, 58);
        this.tutorialTitle = addLabel(this.tutorialNode, 'TutorialTitle', '', 17, Theme.cream, -113, 20, 220, 28);
        this.tutorialBody = addLabel(this.tutorialNode, 'TutorialBody', '', 14, Theme.dim, -113, -16, 220, 28);
        this.tutorialNode.active = false;

        this.pauseRoot = makeNode('PauseRoot', this.root, 0, 0, screenW, screenH);
        const dim = this.pauseRoot.addComponent(Graphics);
        dim.fillColor = new Color(4, 3, 8, 225);
        dim.rect(-screenW * 0.5, -screenH * 0.5, screenW, screenH);
        dim.fill();
        const panel = makeNode('PausePanel', this.pauseRoot, 0, 0, 760, 590);
        const pg = panel.addComponent(Graphics);
        pg.fillColor = new Color(24, 17, 33, 250);
        pg.strokeColor = new Color(216, 178, 122, 180);
        pg.lineWidth = 2;
        pg.roundRect(-380, -295, 760, 590, 24);
        pg.fill();
        pg.stroke();
        const pauseTitle = addLabel(panel, 'PauseTitle', locale.t('game.pauseTitle'), 40, Theme.cream, 0, 225, 600, 60);
        UiFonts.titleLabel(pauseTitle);
        addLabel(panel, 'PauseBody', locale.t('game.pauseBody'), 20, Theme.dim, 0, 175, 620, 36);
        this.createButton(panel, 'Resume', locale.t('game.resume'), 0, 100, 420, 62, () => this.callbacks.onResume());
        this.createButton(panel, 'Settings', locale.t('settings.title'), 0, 22, 420, 62, () => this.callbacks.onSettings());
        const muteButton = this.createButton(panel, 'Mute', locale.t('hud.sound'), 0, -56, 420, 62, () => this.callbacks.onMute());
        this.pauseMuteLabel = muteButton.getComponentInChildren(Label)!;
        this.createButton(panel, 'Restart', locale.t('game.restart'), 0, -134, 420, 62, () => this.callbacks.onRestart());

        addLabel(panel, 'DifficultyTitle', locale.t('menu.subtitle'), 17, Theme.dim, 0, -205, 420, 30);
        this.createButton(panel, 'Easy', locale.difficultyName('easy'), -230, -255, 200, 52, () => this.callbacks.onDifficulty('easy'));
        this.createButton(panel, 'Normal', locale.difficultyName('normal'), 0, -255, 200, 52, () => this.callbacks.onDifficulty('normal'));
        this.createButton(panel, 'Hard', locale.difficultyName('hard'), 230, -255, 200, 52, () => this.callbacks.onDifficulty('hard'));
        this.pauseRoot.active = false;

        this.overlayRoot = makeNode('Overlay', this.root, 0, 0, screenW, screenH);
        const overlayBg = this.overlayRoot.addComponent(Graphics);
        overlayBg.fillColor = new Color(4, 3, 8, 225);
        overlayBg.rect(-screenW * 0.5, -screenH * 0.5, screenW, screenH);
        overlayBg.fill();
        const artNode = makeNode('OverlayArt', this.overlayRoot, 0, 255, 220, 220);
        this.overlayArt = artNode.addComponent(Sprite);
        this.overlayTitle = addLabel(this.overlayRoot, 'OverlayTitle', '', 40, Theme.cream, 0, 90, 1100, 70);
        UiFonts.titleLabel(this.overlayTitle);
        this.overlayBody = addLabel(this.overlayRoot, 'OverlayBody', '', 23, Theme.cream, 0, 10, 1100, 90);
        this.overlayHint = addLabel(this.overlayRoot, 'OverlayHint', '', 18, Theme.dim, 0, -80, 1100, 50);
        this.overlayRoot.active = false;
    }

    setStats(stats: HudStats): void {
        this.trackLabel.string = locale.t(stats.exitOpen ? 'hud.trackOpen' : 'hud.track', {
            n: stats.collected,
            total: stats.total,
        });
        this.timerLabel.string = timeText(stats.timeLeft);
        this.timerLabel.color = stats.timeLeft <= 30 ? Theme.rose : Theme.amber;
        this.stepLabel.string = locale.t('hud.steps', { steps: stats.steps, time: timeText(stats.elapsed) });
        this.seedLabel.string = locale.t('hud.seed', {
            seed: stats.seed,
            level: stats.levelLabel,
            cols: stats.cols,
            rows: stats.rows,
            time: timeText(stats.timeLimit),
        });
    }

    toast(text: string, duration = 2): void {
        const token = ++this.toastToken;
        this.toastLabel.string = text;
        this.toastNode.active = true;
        this.scheduleOnce(() => {
            if (token === this.toastToken) this.toastNode.active = false;
        }, duration);
    }

    showTutorial(type: ItemType, text: string): void {
        const token = ++this.tutorialToken;
        this.tutorialIcon.string = locale.itemShort(type);
        this.tutorialTitle.string = locale.t('hud.tutorial', { name: locale.itemName(type) });
        this.tutorialBody.string = text;
        this.tutorialNode.active = true;
        this.scheduleOnce(() => {
            if (token === this.tutorialToken) this.tutorialNode.active = false;
        }, 2.8);
    }

    showPausePanel(): void {
        this.overlayRoot.active = false;
        this.pauseRoot.active = true;
    }

    hidePausePanel(): void {
        this.pauseRoot.active = false;
    }

    showOverlay(title: string, body: string, hint: string, art: SpriteFrame | null = null): void {
        this.pauseRoot.active = false;
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
        node.getComponent(UITransform)!.setContentSize(220, 220);
        node.active = true;
    }

    hideOverlay(): void {
        this.overlayRoot.active = false;
    }

    setMuted(muted: boolean): void {
        this.pauseMuteLabel.string = muted ? locale.t('hud.mute') : locale.t('hud.sound');
        this.pauseMuteLabel.color = muted ? Theme.rose : Theme.cream;
    }

    dispose(): void {
        this.toastToken++;
        this.tutorialToken++;
        if (this.root?.isValid) this.root.destroy();
    }

    private createButton(
        parent: Node,
        name: string,
        text: string,
        x: number,
        y: number,
        w: number,
        h: number,
        onClick: () => void,
    ): Node {
        const node = makeNode(name, parent, x, y, w, h);
        const g = node.addComponent(Graphics);
        g.fillColor = new Color(43, 33, 54, 235);
        g.strokeColor = new Color(216, 178, 122, 180);
        g.lineWidth = 2;
        g.roundRect(-w * 0.5, -h * 0.5, w, h, 14);
        g.fill();
        g.stroke();
        addLabel(node, name + 'Label', text, 20, Theme.cream, 0, 0, w - 12, h);
        const press = (event: EventTouch | EventMouse): void => {
            event.propagationStopped = true;
            onClick();
        };
        node.on(Node.EventType.TOUCH_END, press, this);
        node.on(Node.EventType.MOUSE_UP, press, this);
        return node;
    }
}