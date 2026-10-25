import { Color, EventMouse, EventTouch, Graphics, Label, Node, UITransform, Vec3 } from 'cc';
import { locale } from '../core/Locale';
import { Theme, addLabel, makeNode } from './UiKit';
import { UiFonts } from './UiFonts';

/**
 * Settings overlay: volume, mute, language, vibration, reset records.
 * Language changes return to the menu so every view is rebuilt in the new locale.
 */
export class SettingsView {
    private readonly root: Node;
    private readonly volumeLabel: Label;
    private readonly muteLabel: Label;
    private readonly languageLabel: Label;
    private readonly vibrationLabel: Label;
    private readonly resetLabel: Label;
    private readonly fill: Graphics;
    private readonly knob: Node;
    private readonly track: Node;
    private readonly trackWidth = 560;
    private volume: number;
    private muted: boolean;
    private vibration: boolean;
    private resetArmed = false;
    private resetTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(
        parent: Node,
        private readonly screenW: number,
        private readonly screenH: number,
        volume: number,
        muted: boolean,
        vibration: boolean,
        private readonly onVolume: (volume: number) => void,
        private readonly onToggleMute: () => boolean,
        private readonly onToggleLanguage: () => void,
        private readonly onToggleVibration: () => boolean,
        private readonly onResetRecords: () => void,
        private readonly onTutorial: () => void,
        private readonly onClose: () => void,
    ) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.muted = muted;
        this.vibration = vibration;

        this.root = makeNode('SettingsRoot', parent, 0, 0, screenW, screenH);
        const bg = this.root.addComponent(Graphics);
        bg.fillColor = new Color(3, 2, 7, 250);
        bg.rect(-screenW * 0.5, -screenH * 0.5, screenW, screenH);
        bg.fill();

        const panel = makeNode('SettingsPanel', this.root, 0, 0, 820, 820);
        const pg = panel.addComponent(Graphics);
        pg.fillColor = new Color(28, 20, 38, 250);
        pg.strokeColor = Theme.wall;
        pg.lineWidth = 2;
        pg.roundRect(-410, -410, 820, 820, 24);
        pg.fill();
        pg.stroke();

        const settingsTitle = addLabel(panel, 'SettingsTitle', locale.t('settings.title'), 40, Theme.cream, 0, 340, 720, 60);
        UiFonts.titleLabel(settingsTitle);
        addLabel(panel, 'VolumeCaption', locale.t('settings.volume'), 20, Theme.dim, 0, 250, 720, 34);
        this.volumeLabel = addLabel(panel, 'VolumeValue', '', 18, Theme.cream, 0, 216, 720, 30);

        this.track = makeNode('VolumeTrack', panel, 0, 160, this.trackWidth, 44);
        const tg = this.track.addComponent(Graphics);
        tg.fillColor = new Color(16, 11, 24, 255);
        tg.strokeColor = new Color(90, 72, 100, 255);
        tg.lineWidth = 2;
        tg.roundRect(-this.trackWidth * 0.5, -11, this.trackWidth, 22, 11);
        tg.fill();
        tg.stroke();

        const fillNode = makeNode('VolumeFill', panel, -this.trackWidth * 0.5, 160, this.trackWidth, 20);
        fillNode.getComponent(UITransform)!.setAnchorPoint(0, 0.5);
        this.fill = fillNode.addComponent(Graphics);

        this.knob = makeNode('VolumeKnob', panel, 0, 160, 40, 40);
        const kg = this.knob.addComponent(Graphics);
        kg.fillColor = Theme.amber;
        kg.strokeColor = Theme.cream;
        kg.lineWidth = 2;
        kg.circle(0, 0, 17);
        kg.fill();
        kg.stroke();

        this.muteLabel = this.addButton(panel, 70, 420);
        this.languageLabel = this.addButton(panel, -10, 420);
        this.vibrationLabel = this.addButton(panel, -90, 420);
        this.resetLabel = this.addButton(panel, -170, 420);
        const tutorialLabel = this.addButton(panel, -250, 420);
        tutorialLabel.string = locale.t('tutorial.settings');

        const close = makeNode('SettingsClose', panel, 0, -350, 360, 62);
        const cg = close.addComponent(Graphics);
        cg.fillColor = new Color(45, 34, 58, 240);
        cg.strokeColor = Theme.wall;
        cg.lineWidth = 2;
        cg.roundRect(-180, -31, 360, 62, 16);
        cg.fill();
        cg.stroke();
        addLabel(close, 'SettingsCloseLabel', locale.t('settings.close'), 22, Theme.cream, 0, 0, 360, 62);

        const closePress = (event: EventTouch | EventMouse): void => {
            event.propagationStopped = true;
            this.onClose();
        };
        close.on(Node.EventType.TOUCH_END, closePress, this);
        close.on(Node.EventType.MOUSE_UP, closePress, this);

        this.bindPress(this.muteLabel.node.parent!, () => this.setMuted(this.onToggleMute()));
        this.bindPress(this.languageLabel.node.parent!, () => this.onToggleLanguage());
        this.bindPress(this.vibrationLabel.node.parent!, () => this.setVibration(this.onToggleVibration()));
        this.bindPress(this.resetLabel.node.parent!, () => this.pressReset());
        this.bindPress(tutorialLabel.node.parent!, () => this.onTutorial());

        const drag = (event: EventTouch | EventMouse): void => {
            event.propagationStopped = true;
            const ui = event.getUILocation();
            const local = this.track.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(ui.x, ui.y, 0));
            const value = (local.x + this.trackWidth * 0.5) / this.trackWidth;
            this.setVolume(value, true);
        };
        for (const type of [Node.EventType.TOUCH_START, Node.EventType.TOUCH_MOVE, Node.EventType.TOUCH_END]) {
            this.track.on(type, drag, this);
        }
        for (const type of [Node.EventType.MOUSE_DOWN, Node.EventType.MOUSE_MOVE, Node.EventType.MOUSE_UP]) {
            this.track.on(type, drag, this);
        }

        this.setMuted(muted);
        this.setVibration(vibration);
        this.languageLabel.string = locale.t('settings.language', {
            value: locale.language === 'zh' ? '中文' : 'English',
        });
        this.resetLabel.string = locale.t('settings.reset');
        this.resetLabel.color = Theme.cream;
        this.setVolume(this.volume, false);
    }

    dispose(): void {
        if (this.resetTimer !== null) clearTimeout(this.resetTimer);
        this.resetTimer = null;
        if (this.root?.isValid) this.root.destroy();
    }

    setMuted(muted: boolean): void {
        this.muted = muted;
        this.muteLabel.string = muted ? locale.t('settings.muteOn') : locale.t('settings.muteOff');
        this.muteLabel.color = muted ? Theme.rose : Theme.cream;
    }

    private setVibration(enabled: boolean): void {
        this.vibration = enabled;
        this.vibrationLabel.string = locale.t('settings.vibration', {
            value: locale.t(enabled ? 'settings.vibrationOn' : 'settings.vibrationOff'),
        });
        this.vibrationLabel.color = enabled ? Theme.mint : Theme.dim;
    }

    private pressReset(): void {
        if (!this.resetArmed) {
            this.resetArmed = true;
            this.resetLabel.string = locale.t('settings.resetConfirm');
            this.resetLabel.color = Theme.rose;
            this.resetTimer = setTimeout(() => {
                this.resetArmed = false;
                this.resetLabel.string = locale.t('settings.reset');
                this.resetLabel.color = Theme.cream;
            }, 3000);
            return;
        }

        this.resetArmed = false;
        if (this.resetTimer !== null) clearTimeout(this.resetTimer);
        this.resetTimer = null;
        this.onResetRecords();
        this.resetLabel.string = locale.t('settings.resetDone');
        this.resetLabel.color = Theme.mint;
        this.resetTimer = setTimeout(() => {
            this.resetLabel.string = locale.t('settings.reset');
            this.resetLabel.color = Theme.cream;
        }, 2000);
    }

    private setVolume(value: number, notify: boolean): void {
        this.volume = Math.max(0, Math.min(1, value));
        this.volumeLabel.string = locale.t('settings.volumeValue', { n: Math.round(this.volume * 100) });
        const w = this.trackWidth * this.volume;
        this.fill.clear();
        if (w > 0.5) {
            this.fill.fillColor = Theme.cyan;
            this.fill.roundRect(0, -8, w, 16, 8);
            this.fill.fill();
        }
        this.knob.setPosition(-this.trackWidth * 0.5 + w, 160, 0);
        if (notify) this.onVolume(this.volume);
    }

    private addButton(parent: Node, y: number, width: number): Label {
        const node = makeNode('SettingsButton_' + y, parent, 0, y, width, 64);
        const g = node.addComponent(Graphics);
        g.fillColor = new Color(42, 31, 54, 240);
        g.strokeColor = new Color(170, 158, 145, 180);
        g.lineWidth = 2;
        g.roundRect(-width * 0.5, -32, width, 64, 16);
        g.fill();
        g.stroke();
        return addLabel(node, 'SettingsButtonLabel', '', 22, Theme.cream, 0, 0, width, 54);
    }

    private bindPress(node: Node, action: () => void): void {
        const press = (event: EventTouch | EventMouse): void => {
            event.propagationStopped = true;
            action();
        };
        for (const target of [node, ...node.children]) {
            target.on(Node.EventType.TOUCH_END, press, this);
            target.on(Node.EventType.MOUSE_UP, press, this);
        }
    }
}

