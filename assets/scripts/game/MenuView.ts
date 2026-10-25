import { Color, EventMouse, EventTouch, Graphics, Node, resources, Sprite, SpriteFrame, UITransform } from 'cc';
import { locale } from '../core/Locale';
import type { BestRecord } from '../core/ProgressStore';
import { DIFFICULTY_ORDER, Difficulty, LEVELS, LevelConfig } from './LevelConfig';
import { Theme, addLabel, makeNode, timeText } from './UiKit';
import { UiFonts } from './UiFonts';

/**
 * Pre-run difficulty selector + best records + mute toggle.
 */
export class MenuView {
    private readonly root: Node;

    constructor(
        parent: Node,
        private readonly screenW: number,
        private readonly screenH: number,
        private readonly best: Partial<Record<Difficulty, BestRecord>>,
        private readonly onSelect: (difficulty: Difficulty) => void,
        private readonly onSettings: () => void,
    ) {
        this.root = makeNode('MenuRoot', parent, 0, 0, screenW, screenH);

        const bg = this.root.addComponent(Graphics);
        bg.fillColor = new Color(5, 3, 10, 250);
        bg.rect(-screenW * 0.5, -screenH * 0.5, screenW, screenH);
        bg.fill();

        // Optional illustrated corridor background; labels stay above it.
        const bgNode = makeNode('MenuBg', this.root, 0, 0, screenW, screenH);
        bgNode.setSiblingIndex(0);
        const bgSprite = bgNode.addComponent(Sprite);
        bgSprite.sizeMode = Sprite.SizeMode.CUSTOM;
        bgSprite.trim = false;
        resources.load('art/ui/menu_bg/spriteFrame', SpriteFrame, (err, frame) => {
            if (err || !frame || !bgNode.isValid) return;
            bgSprite.spriteFrame = frame;
            bgNode.getComponent(UITransform)!.setContentSize(screenW, screenH);
        });

        const menuTitle = addLabel(this.root, 'MenuTitle', locale.t('menu.title'), 58, Theme.cream, 0, screenH * 0.5 - 190, 900, 80);
        UiFonts.titleLabel(menuTitle);
        addLabel(this.root, 'MenuSub', locale.t('menu.subtitle'), 24, Theme.cyan, 0, screenH * 0.5 - 255, 900, 44);

        // Keep the illustrated corridor visible at the edges, but give the
        // three difficulty cards a quiet, opaque column so the cat/record
        // do not show through the text.
        const panel = makeNode('MenuPanel', this.root, 0, -50, 560, 480);
        const panelG = panel.addComponent(Graphics);
        panelG.fillColor = new Color(12, 9, 18, 210);
        panelG.strokeColor = new Color(216, 178, 122, 90);
        panelG.lineWidth = 1;
        panelG.roundRect(-280, -240, 560, 480, 24);
        panelG.fill();
        panelG.stroke();

        DIFFICULTY_ORDER.forEach((id, index) => {
            this.addButton(LEVELS[id], 80 - index * 132);
        });

        const hintBg = makeNode('MenuHintBg', this.root, 0, -screenH * 0.5 + 90, 820, 42);
        const hintG = hintBg.addComponent(Graphics);
        hintG.fillColor = new Color(8, 6, 14, 190);
        hintG.roundRect(-410, -21, 820, 42, 16);
        hintG.fill();
        addLabel(
            this.root,
            'MenuHint',
            locale.t('menu.hint'),
            17,
            Theme.dim,
            0,
            -screenH * 0.5 + 90,
            1000,
            36,
        );

        const settings = makeNode('MenuSettings', this.root, screenW * 0.5 - 64, screenH * 0.5 - 80, 50, 50);
        const sg = settings.addComponent(Graphics);
        sg.fillColor = new Color(40, 31, 54, 220);
        sg.strokeColor = new Color(170, 158, 145, 180);
        sg.lineWidth = 2;
        sg.circle(0, 0, 25);
        sg.fill();
        sg.stroke();
        addLabel(settings, 'MenuSettingsLabel', locale.t('menu.settings'), 18, Theme.cream, 0, 0, 50, 50);
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

    private addButton(level: LevelConfig, y: number): void {
        const node = makeNode('Menu_' + level.id, this.root, 0, y, 520, 112);
        const g = node.addComponent(Graphics);
        g.fillColor = new Color(38, 28, 50, 252);
        g.strokeColor = level.id === 'hard' ? Theme.rose : Theme.wall;
        g.lineWidth = 2;
        g.roundRect(-260, -56, 520, 112, 18);
        g.fill();
        g.stroke();

        const menuLabel = addLabel(
            node,
            'MenuLabel',
            `${locale.difficultyName(level.id)} · ${locale.difficultySubtitle(level.id)}`,
            22,
            Theme.cream,
            0,
            30,
            520,
            36,
        );
        UiFonts.titleLabel(menuLabel);
        addLabel(
            node,
            'MenuDesc',
            locale.t('menu.meta', {
                cols: level.cols,
                rows: level.rows,
                fragments: level.fragments,
                time: timeText(level.timeLimit),
            }),
            15,
            Theme.dim,
            0,
            2,
            520,
            28,
        );

        const rec = this.best[level.id];
        const bestText = rec
            ? locale.t('menu.best', {
                  stars: `${'★'.repeat(rec.stars)}${'☆'.repeat(3 - rec.stars)}`,
                  time: timeText(rec.elapsed),
              })
            : locale.t('menu.bestNone');
        addLabel(node, 'MenuBest', bestText, 13, rec ? Theme.amber : Theme.dim, 0, -34, 520, 24);

        const press = (event: EventTouch | EventMouse): void => {
            event.propagationStopped = true;
            this.onSelect(level.id);
        };
        node.on(Node.EventType.TOUCH_END, press, this);
        node.on(Node.EventType.MOUSE_UP, press, this);
    }
}



