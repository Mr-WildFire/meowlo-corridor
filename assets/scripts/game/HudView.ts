import {
    Color,
    EventMouse,
    EventTouch,
    Graphics,
    Label,
    Node,
    resources,
    Sprite,
    SpriteFrame,
    UITransform,
    Vec3,
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
    onBackToMenu(): void;
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
    private readonly overlayRoot: Node;
    private readonly overlayArt: Sprite;
    private readonly overlayTitle: Label;
    private readonly overlayBody: Label;
    private readonly overlayHint: Label;
    private bottomBusy = false;
    private readonly bottomQueue: Array<{ show: () => void; duration: number }> = [];

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

        // Formal HUD skin. The Graphics above stays as a fallback while the
        // texture is loading (or if the asset is missing).
        this.addHudSprite(bar, 'TopBarSkin', 'art/ui/hud/hud_bar/spriteFrame', 0, 0, screenW, 72);

        // Keep the strip inside the central 1440px so it also fits 4:3
        // Cocos preview windows, not only a 16:9 device.
        this.trackLabel = addLabel(bar, 'Track', '', 21, Theme.cream, -500, 0, 340, 44);
        addLabel(bar, 'TimeCaption', locale.t('hud.timeCaption'), 17, Theme.dim, -245, 0, 70, 40);
        this.timerLabel = addLabel(bar, 'Timer', '', 30, Theme.amber, -150, 0, 160, 48);
        UiFonts.numberLabel(this.timerLabel);
        this.stepLabel = addLabel(bar, 'Steps', '', 19, Theme.cream, 130, 0, 180, 44);
        this.seedLabel = addLabel(bar, 'Seed', '', 13, Theme.dim, 430, 0, 300, 40);

        this.addHudSprite(bar, 'HudIconTrack', 'art/ui/hud/hud_icon_track/spriteFrame', -700, 0, 44, 44);
        this.addHudSprite(bar, 'HudIconTime', 'art/ui/hud/hud_icon_time/spriteFrame', -320, 0, 44, 44);
        this.addHudSprite(bar, 'HudIconSteps', 'art/ui/hud/hud_icon_steps/spriteFrame', 5, 0, 44, 44);
        this.addHudSprite(bar, 'HudIconSeed', 'art/ui/hud/hud_icon_seed/spriteFrame', 250, 0, 44, 44);

        this.createButton(bar, 'MenuButton', '≡', 610, 0, 58, 50, () => this.callbacks.onMenu());
        // The skin/icon sprites are the visual layer; this transparent hit area
        // sits on top so the menu always receives the tap, even if a child
        // sprite becomes the touch target.
        const menuHit = makeNode('MenuHit', bar, 610, 0, 64, 52);
        const menuHitG = menuHit.addComponent(Graphics);
        menuHitG.fillColor = new Color(0, 0, 0, 1);
        menuHitG.rect(-32, -26, 64, 52);
        menuHitG.fill();
        const menuTap = (event: EventTouch | EventMouse): void => {
            event.propagationStopped = true;
            this.callbacks.onMenu();
        };
        menuHit.on(Node.EventType.TOUCH_END, menuTap, this);
        menuHit.on(Node.EventType.MOUSE_UP, menuTap, this);

        this.toastNode = makeNode('Toast', this.root, 0, -screenH * 0.5 + 88, 980, 48);
        const toastBg = this.toastNode.addComponent(Graphics);
        toastBg.fillColor = new Color(22, 16, 30, 230);
        toastBg.roundRect(-490, -24, 980, 48, 18);
        toastBg.fill();
        this.toastLabel = addLabel(this.toastNode, 'ToastLabel', '', 21, Theme.cream, 0, 0, 950, 44);
        this.toastNode.active = false;

        // First-time item tutorial uses the same bottom-center slot as toast.
        // HudView alternates them instead of drawing both cards on top of each other.
        this.tutorialNode = makeNode('Tutorial', this.root, 0, -screenH * 0.5 + 88, 900, 76);
        const tutorialBg = this.tutorialNode.addComponent(Graphics);
        tutorialBg.fillColor = new Color(30, 23, 40, 246);
        tutorialBg.strokeColor = new Color(216, 178, 122, 200);
        tutorialBg.lineWidth = 2;
        tutorialBg.roundRect(-450, -38, 900, 76, 18);
        tutorialBg.fill();
        tutorialBg.stroke();
        const iconNode = makeNode('TutorialIcon', this.tutorialNode, -405, 0, 56, 56);
        const iconG = iconNode.addComponent(Graphics);
        iconG.fillColor = new Color(242, 179, 92, 60);
        iconG.circle(0, 0, 26);
        iconG.fill();
        iconG.strokeColor = Theme.amber;
        iconG.lineWidth = 2;
        iconG.circle(0, 0, 26);
        iconG.stroke();
        this.tutorialIcon = addLabel(iconNode, 'TutorialIconLabel', '?', 18, Theme.cream, 0, 0, 56, 56);
        this.tutorialTitle = addLabel(this.tutorialNode, 'TutorialTitle', '', 17, Theme.cream, -80, 16, 680, 28);
        this.tutorialBody = addLabel(this.tutorialNode, 'TutorialBody', '', 14, Theme.dim, -80, -15, 680, 28);
        this.tutorialNode.active = false;

        this.pauseRoot = makeNode('PauseRoot', this.root, 0, 0, screenW, screenH);
        const dim = this.pauseRoot.addComponent(Graphics);
        dim.fillColor = new Color(4, 3, 8, 225);
        dim.rect(-screenW * 0.5, -screenH * 0.5, screenW, screenH);
        dim.fill();
        // Sprite versions are used on device; Graphics above remains a fallback.
        this.addHudSprite(this.pauseRoot, 'PauseDimSkin', 'art/ui/pause/pause_dim/spriteFrame', 0, 0, screenW, screenH);
        // Match the menu-page settings panel: same 820x820 footprint, same
        // aubergine fill, same muted border and button rhythm.
        const panel = makeNode('PausePanel', this.pauseRoot, 0, 0, 820, 820);
        const pg = panel.addComponent(Graphics);
        pg.fillColor = new Color(28, 20, 38, 250);
        pg.strokeColor = Theme.wall;
        pg.lineWidth = 2;
        pg.roundRect(-410, -410, 820, 820, 24);
        pg.fill();
        pg.stroke();
        const panelSkin = this.addHudSprite(panel, 'PausePanelSkin', 'art/ui/pause/pause_panel/spriteFrame', 0, 0, 820, 820);
        panelSkin.node.on(Node.EventType.TOUCH_END, (event: EventTouch) => this.handlePauseTouch(event, panel), this);
        panelSkin.node.on(Node.EventType.MOUSE_UP, (event: EventMouse) => this.handlePauseTouch(event, panel), this);
        const pauseTitle = addLabel(panel, 'PauseTitle', locale.t('game.pauseTitle'), 40, Theme.cream, 0, 330, 720, 60);
        UiFonts.titleLabel(pauseTitle);
        addLabel(panel, 'PauseBody', locale.t('game.pauseBody'), 20, Theme.dim, 0, 280, 680, 36);
        this.createButton(panel, 'Settings', locale.t('settings.title'), 0, 200, 420, 64, () => this.callbacks.onSettings(), 'art/ui/pause/pause_button/spriteFrame');
        this.createButton(panel, 'Restart', locale.t('game.restart'), 0, 120, 420, 64, () => this.callbacks.onRestart(), 'art/ui/pause/pause_button/spriteFrame');
        this.createButton(panel, 'BackToMenu', locale.t('game.backToMenu'), 0, 40, 420, 64, () => this.callbacks.onBackToMenu(), 'art/ui/pause/pause_button/spriteFrame');

        addLabel(panel, 'DifficultyTitle', locale.t('menu.subtitle'), 17, Theme.dim, 0, -50, 420, 30);
        this.createButton(panel, 'Easy', locale.difficultyName('easy'), -230, -115, 200, 52, () => this.callbacks.onDifficulty('easy'), 'art/ui/pause/pause_button_small/spriteFrame');
        this.createButton(panel, 'Normal', locale.difficultyName('normal'), 0, -115, 200, 52, () => this.callbacks.onDifficulty('normal'), 'art/ui/pause/pause_button_small/spriteFrame');
        this.createButton(panel, 'Hard', locale.difficultyName('hard'), 230, -115, 200, 52, () => this.callbacks.onDifficulty('hard'), 'art/ui/pause/pause_button_small/spriteFrame');
        addLabel(panel, 'PauseHint', locale.t('game.pauseHint'), 15, Theme.dim, 0, -215, 680, 30);
        this.createButton(panel, 'ResumeBottom', locale.t('game.resume'), 0, -340, 360, 62, () => this.callbacks.onResume(), 'art/ui/pause/pause_button_wide/spriteFrame');
        // Native hit targets above the skin sprites. Sprite children can become
        // the touch target on device, so keep explicit transparent buttons.
        this.addHitTarget(panel, 0, 200, 420, 64, () => this.callbacks.onSettings());
        this.addHitTarget(panel, 0, 120, 420, 64, () => this.callbacks.onRestart());
        this.addHitTarget(panel, 0, 40, 420, 64, () => this.callbacks.onBackToMenu());
        this.addHitTarget(panel, -230, -115, 200, 52, () => this.callbacks.onDifficulty('easy'));
        this.addHitTarget(panel, 0, -115, 200, 52, () => this.callbacks.onDifficulty('normal'));
        this.addHitTarget(panel, 230, -115, 200, 52, () => this.callbacks.onDifficulty('hard'));
        this.addHitTarget(panel, 0, -340, 360, 62, () => this.callbacks.onResume());
        // Last-resort UI hit test: any tap on the pause overlay is converted to
        // panel-local coordinates, so it does not depend on child sprite targets.
        this.pauseRoot.on(Node.EventType.TOUCH_END, (event: EventTouch) => this.handlePauseTouch(event, panel), this);
        this.pauseRoot.on(Node.EventType.MOUSE_UP, (event: EventMouse) => this.handlePauseTouch(event, panel), this);
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
        this.stepLabel.string = locale.t('hud.steps', { steps: stats.steps });
        this.seedLabel.string = locale.t('hud.seed', {
            seed: stats.seed,
            level: stats.levelLabel,
            cols: stats.cols,
            rows: stats.rows,
            time: timeText(stats.timeLimit),
        });
    }

    toast(text: string, duration = 2): void {
        this.enqueueBottom(() => {
            this.tutorialNode.active = false;
            this.toastLabel.string = text;
            this.toastNode.active = true;
        }, duration);
    }

    showTutorial(type: ItemType, text: string): void {
        this.enqueueBottom(() => {
            this.toastNode.active = false;
            this.tutorialIcon.string = locale.itemShort(type);
            this.tutorialTitle.string = locale.t('hud.tutorial', { name: locale.itemName(type) });
            this.tutorialBody.string = text;
            this.tutorialNode.active = true;
        }, 2.8);
    }

    private enqueueBottom(show: () => void, duration: number): void {
        const item = { show, duration };
        if (this.bottomBusy) {
            this.bottomQueue.push(item);
            if (this.bottomQueue.length > 4) this.bottomQueue.shift();
            return;
        }
        this.playBottom(item);
    }

    private playBottom(item: { show: () => void; duration: number }): void {
        this.bottomBusy = true;
        this.toastNode.active = false;
        this.tutorialNode.active = false;
        item.show();
        this.scheduleOnce(() => {
            this.bottomBusy = false;
            this.toastNode.active = false;
            this.tutorialNode.active = false;
            const next = this.bottomQueue.shift();
            if (next) this.playBottom(next);
        }, item.duration);
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

    setMuted(_muted: boolean): void {
        // Mute is still available from Settings and the V shortcut; the pause
        // panel no longer duplicates it.
    }

    dispose(): void {
        this.bottomBusy = false;
        this.bottomQueue.length = 0;
        if (this.root?.isValid) this.root.destroy();
    }

    private handlePauseTouch(event: EventTouch | EventMouse, panel: Node): void {
        const ui = event.getUILocation();
        const local = panel.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(ui.x, ui.y, 0));
        const hit = (x: number, y: number, w: number, h: number): boolean =>
            Math.abs(local.x - x) <= w * 0.5 && Math.abs(local.y - y) <= h * 0.5;
        event.propagationStopped = true;
        if (hit(0, 200, 420, 64)) this.callbacks.onSettings();
        else if (hit(0, 120, 420, 64)) this.callbacks.onRestart();
        else if (hit(0, 40, 420, 64)) this.callbacks.onBackToMenu();
        else if (hit(-230, -115, 200, 52)) this.callbacks.onDifficulty('easy');
        else if (hit(0, -115, 200, 52)) this.callbacks.onDifficulty('normal');
        else if (hit(230, -115, 200, 52)) this.callbacks.onDifficulty('hard');
        else if (hit(0, -340, 360, 62)) this.callbacks.onResume();
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
        skinPath?: string,
    ): Node {
        const node = makeNode(name, parent, x, y, w, h);
        const g = node.addComponent(Graphics);
        g.fillColor = new Color(42, 31, 54, 240);
        g.strokeColor = new Color(170, 158, 145, 180);
        g.lineWidth = 2;
        g.roundRect(-w * 0.5, -h * 0.5, w, h, 16);
        g.fill();
        g.stroke();
        const touchChildren: Node[] = [];
        if (skinPath) {
            const skin = this.addHudSprite(node, 'ButtonSkin', skinPath, 0, 0, w, h);
            touchChildren.push(skin.node);
        }
        const buttonLabel = addLabel(node, name + 'Label', text, w >= 400 ? 22 : 18, Theme.cream, 0, 0, w - 12, h);
        if (text !== '≡') UiFonts.titleLabel(buttonLabel);
        touchChildren.push(buttonLabel.node);
        if (name === 'MenuButton') {
            const skin = this.addHudSprite(node, 'MenuSkin', 'art/ui/hud/hud_menu_normal/spriteFrame', 0, 0, w, h);
            const icon = this.addHudSprite(node, 'MenuIcon', 'art/ui/hud/hud_menu_icon/spriteFrame', 0, 0, 30, 30, () => {
                buttonLabel.node.active = false;
            });
            touchChildren.push(skin.node, icon.node);
        }
        const press = (event: EventTouch | EventMouse): void => {
            event.propagationStopped = true;
            onClick();
        };
        node.on(Node.EventType.TOUCH_END, press, this);
        node.on(Node.EventType.MOUSE_UP, press, this);
        // Child sprites/labels are the actual hit target; forward their events.
        for (const child of touchChildren) {
            child.on(Node.EventType.TOUCH_END, press, this);
            child.on(Node.EventType.MOUSE_UP, press, this);
        }
        return node;
    }

    private addHitTarget(parent: Node, x: number, y: number, w: number, h: number, onClick: () => void): void {
        const node = makeNode('HitTarget', parent, x, y, w, h);
        const g = node.addComponent(Graphics);
        g.fillColor = new Color(0, 0, 0, 1);
        g.rect(-w * 0.5, -h * 0.5, w, h);
        g.fill();
        const press = (event: EventTouch | EventMouse): void => {
            event.propagationStopped = true;
            onClick();
        };
        node.on(Node.EventType.TOUCH_END, press, this);
        node.on(Node.EventType.MOUSE_UP, press, this);
    }

    private addHudSprite(
        parent: Node,
        name: string,
        path: string,
        x: number,
        y: number,
        w: number,
        h: number,
        onLoaded?: () => void,
    ): Sprite {
        const node = makeNode(name, parent, x, y, w, h);
        const ut = node.getComponent(UITransform)!;
        ut.setContentSize(w, h);
        const sprite = node.addComponent(Sprite);
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        sprite.type = Sprite.Type.SIMPLE;
        sprite.trim = false;
        resources.load(path, SpriteFrame, (err, frame) => {
            if (err || !frame || !sprite.isValid) {
                if (err) console.warn('[HudView] missing skin:', path, err);
                return;
            }
            sprite.spriteFrame = frame;
            ut.setContentSize(w, h);
            onLoaded?.();
        });
        return sprite;
    }
}







