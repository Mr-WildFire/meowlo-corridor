import { Color, EventMouse, EventTouch, Graphics, Label, Node } from 'cc';
import type { BestRecord } from '../core/ProgressStore';
import { DIFFICULTY_ORDER, Difficulty, LEVELS, LevelConfig } from './LevelConfig';
import { Theme, addLabel, makeNode, timeText } from './UiKit';

/**
 * Pre-run difficulty selector + best records + mute toggle.
 */
export class MenuView {
    private readonly root: Node;
    private readonly muteLabel: Label;

    constructor(
        parent: Node,
        private readonly screenW: number,
        private readonly screenH: number,
        private readonly best: Partial<Record<Difficulty, BestRecord>>,
        muted: boolean,
        private readonly onSelect: (difficulty: Difficulty) => void,
        private readonly onToggleMute: () => boolean,
        private readonly onSettings: () => void,
    ) {
        this.root = makeNode('MenuRoot', parent, 0, 0, screenW, screenH);

        const bg = this.root.addComponent(Graphics);
        bg.fillColor = new Color(5, 3, 10, 250);
        bg.rect(-screenW * 0.5, -screenH * 0.5, screenW, screenH);
        bg.fill();

        addLabel(this.root, 'MenuTitle', '喵音回廊', 58, Theme.cream, 0, screenH * 0.5 - 190, 900, 80);
        addLabel(this.root, 'MenuSub', '选择难度', 24, Theme.cyan, 0, screenH * 0.5 - 255, 900, 44);

        DIFFICULTY_ORDER.forEach((id, index) => {
            this.addButton(LEVELS[id], 80 - index * 132);
        });

        addLabel(
            this.root,
            'MenuHint',
            '点击难度开始　·　1 / 2 / 3 也可选择',
            17,
            Theme.dim,
            0,
            -screenH * 0.5 + 90,
            1000,
            36,
        );

        const mute = makeNode('MenuMute', this.root, screenW * 0.5 - 64, screenH * 0.5 - 80, 50, 50);
        const mg = mute.addComponent(Graphics);
        mg.fillColor = new Color(40, 31, 54, 220);
        mg.strokeColor = new Color(170, 158, 145, 180);
        mg.lineWidth = 2;
        mg.circle(0, 0, 25);
        mg.fill();
        mg.stroke();
        this.muteLabel = addLabel(mute, 'MenuMuteLabel', muted ? '静' : '音', 19, Theme.cream, 0, 0, 50, 50);

        const press = (event: EventTouch | EventMouse): void => {
            event.propagationStopped = true;
            this.setMuted(this.onToggleMute());
        };
        mute.on(Node.EventType.TOUCH_END, press, this);
        mute.on(Node.EventType.MOUSE_UP, press, this);

        const settings = makeNode('MenuSettings', this.root, screenW * 0.5 - 130, screenH * 0.5 - 80, 50, 50);
        const sg = settings.addComponent(Graphics);
        sg.fillColor = new Color(40, 31, 54, 220);
        sg.strokeColor = new Color(170, 158, 145, 180);
        sg.lineWidth = 2;
        sg.circle(0, 0, 25);
        sg.fill();
        sg.stroke();
        addLabel(settings, 'MenuSettingsLabel', '设', 18, Theme.cream, 0, 0, 50, 50);
        const settingsPress = (event: EventTouch | EventMouse): void => {
            event.propagationStopped = true;
            this.onSettings();
        };
        settings.on(Node.EventType.TOUCH_END, settingsPress, this);
        settings.on(Node.EventType.MOUSE_UP, settingsPress, this);
    }

    dispose(): void {
        if (this.root?.isValid) this.root.destroy();
    }

    private setMuted(muted: boolean): void {
        this.muteLabel.string = muted ? '静' : '音';
        this.muteLabel.color = muted ? Theme.rose : Theme.cream;
    }

    private addButton(level: LevelConfig, y: number): void {
        const node = makeNode('Menu_' + level.id, this.root, 0, y, 560, 112);
        const g = node.addComponent(Graphics);
        g.fillColor = new Color(38, 28, 50, 235);
        g.strokeColor = level.id === 'hard' ? Theme.rose : Theme.wall;
        g.lineWidth = 2;
        g.roundRect(-280, -56, 560, 112, 18);
        g.fill();
        g.stroke();

        addLabel(node, 'MenuLabel', `${level.label} · ${level.subtitle}`, 22, Theme.cream, 0, 30, 520, 36);
        addLabel(
            node,
            'MenuDesc',
            `${level.cols}×${level.rows} · ${level.fragments} 块碎片 · ${timeText(level.timeLimit)}`,
            15,
            Theme.dim,
            0,
            2,
            520,
            28,
        );

        const rec = this.best[level.id];
        const bestText = rec
            ? `最佳 ${'★'.repeat(rec.stars)}${'☆'.repeat(3 - rec.stars)} · ${timeText(rec.elapsed)}`
            : '最佳 —';
        addLabel(node, 'MenuBest', bestText, 13, rec ? Theme.amber : Theme.dim, 0, -34, 520, 24);

        const press = (event: EventTouch | EventMouse): void => {
            event.propagationStopped = true;
            this.onSelect(level.id);
        };
        node.on(Node.EventType.TOUCH_END, press, this);
        node.on(Node.EventType.MOUSE_UP, press, this);
    }
}
