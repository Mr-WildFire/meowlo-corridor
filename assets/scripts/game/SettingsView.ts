import { Color, EventMouse, EventTouch, Graphics, Label, Node, UITransform, Vec3 } from 'cc';
import { Theme, addLabel, makeNode } from './UiKit';

/**
 * Runtime settings overlay: master volume slider + mute + close.
 * Volume is applied live and persisted by DemoGame/ProgressStore.
 */
export class SettingsView {
    private readonly root: Node;
    private readonly volumeLabel: Label;
    private readonly percentLabel: Label;
    private readonly muteLabel: Label;
    private readonly fill: Graphics;
    private readonly fillNode: Node;
    private readonly knob: Node;
    private readonly track: Node;
    private readonly trackWidth = 560;
    private volume: number;
    private muted: boolean;

    constructor(
        parent: Node,
        private readonly screenW: number,
        private readonly screenH: number,
        volume: number,
        muted: boolean,
        private readonly onVolume: (volume: number) => void,
        private readonly onToggleMute: () => boolean,
        private readonly onClose: () => void,
    ) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.muted = muted;

        this.root = makeNode('SettingsRoot', parent, 0, 0, screenW, screenH);
        const bg = this.root.addComponent(Graphics);
        bg.fillColor = new Color(3, 2, 7, 250);
        bg.rect(-screenW * 0.5, -screenH * 0.5, screenW, screenH);
        bg.fill();

        const panel = makeNode('SettingsPanel', this.root, 0, 0, 800, 560);
        const pg = panel.addComponent(Graphics);
        pg.fillColor = new Color(28, 20, 38, 250);
        pg.strokeColor = Theme.wall;
        pg.lineWidth = 2;
        pg.roundRect(-400, -280, 800, 560, 24);
        pg.fill();
        pg.stroke();

        addLabel(panel, 'SettingsTitle', '设置', 40, Theme.cream, 0, 210, 700, 60);
        addLabel(panel, 'VolumeCaption', '主音量', 20, Theme.dim, 0, 120, 700, 34);
        this.volumeLabel = addLabel(panel, 'VolumeValue', '', 18, Theme.cream, 0, 86, 700, 30);
        this.percentLabel = this.volumeLabel;

        this.track = makeNode('VolumeTrack', panel, 0, 28, this.trackWidth, 44);
        const tg = this.track.addComponent(Graphics);
        tg.fillColor = new Color(16, 11, 24, 255);
        tg.strokeColor = new Color(90, 72, 100, 255);
        tg.lineWidth = 2;
        tg.roundRect(-this.trackWidth * 0.5, -11, this.trackWidth, 22, 11);
        tg.fill();
        tg.stroke();

        this.fillNode = makeNode('VolumeFill', panel, -this.trackWidth * 0.5, 28, this.trackWidth, 20);
        this.fillNode.getComponent(UITransform)!.setAnchorPoint(0, 0.5);
        this.fill = this.fillNode.addComponent(Graphics);

        this.knob = makeNode('VolumeKnob', panel, 0, 28, 40, 40);
        const kg = this.knob.addComponent(Graphics);
        kg.fillColor = Theme.amber;
        kg.strokeColor = Theme.cream;
        kg.lineWidth = 2;
        kg.circle(0, 0, 17);
        kg.fill();
        kg.stroke();

        const muteBtn = makeNode('SettingsMuteButton', panel, 0, -90, 360, 64);
        const muteBg = muteBtn.addComponent(Graphics);
        muteBg.fillColor = new Color(42, 31, 54, 240);
        muteBg.strokeColor = new Color(170, 158, 145, 180);
        muteBg.lineWidth = 2;
        muteBg.roundRect(-180, -32, 360, 64, 16);
        muteBg.fill();
        muteBg.stroke();
        this.muteLabel = addLabel(muteBtn, 'SettingsMuteLabel', '', 22, Theme.cream, 0, 0, 360, 54);

        const close = makeNode('SettingsClose', panel, 0, -220, 360, 62);
        const cg = close.addComponent(Graphics);
        cg.fillColor = new Color(45, 34, 58, 240);
        cg.strokeColor = Theme.wall;
        cg.lineWidth = 2;
        cg.roundRect(-180, -31, 360, 62, 16);
        cg.fill();
        cg.stroke();
        addLabel(close, 'SettingsCloseLabel', '关闭', 22, Theme.cream, 0, 0, 360, 62);

        const closePress = (event: EventTouch | EventMouse): void => {
            event.propagationStopped = true;
            this.onClose();
        };
        close.on(Node.EventType.TOUCH_END, closePress, this);
        close.on(Node.EventType.MOUSE_UP, closePress, this);

        const mutePress = (event: EventTouch | EventMouse): void => {
            event.propagationStopped = true;
            this.setMuted(this.onToggleMute());
        };
        muteBtn.on(Node.EventType.TOUCH_END, mutePress, this);
        muteBtn.on(Node.EventType.MOUSE_UP, mutePress, this);

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
        this.setVolume(this.volume, false);
    }

    dispose(): void {
        if (this.root?.isValid) this.root.destroy();
    }

    private setVolume(value: number, notify: boolean): void {
        this.volume = Math.max(0, Math.min(1, value));
        this.percentLabel.string = `音量 ${Math.round(this.volume * 100)}%`;
        this.volumeLabel.string = this.percentLabel.string;
        const w = this.trackWidth * this.volume;
        this.fill.clear();
        if (w > 0.5) {
            this.fill.fillColor = Theme.cyan;
            this.fill.roundRect(0, -8, w, 16, 8);
            this.fill.fill();
        }
        this.knob.setPosition(-this.trackWidth * 0.5 + w, 28, 0);
        if (notify) this.onVolume(this.volume);
    }

    setMuted(muted: boolean): void {
        this.muted = muted;
        this.muteLabel.string = muted ? '静音：开' : '静音：关';
        this.muteLabel.color = muted ? Theme.rose : Theme.cream;
    }
}
