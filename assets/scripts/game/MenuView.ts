import { Color, EventMouse, EventTouch, Graphics, Node } from 'cc';
import { DIFFICULTY_ORDER, Difficulty, LEVELS, LevelConfig } from './LevelConfig';
import { Theme, addLabel, makeNode, timeText } from './UiKit';

/**
 * Pre-run difficulty selector. Uses Graphics/Label until the final UI art exists.
 */
export class MenuView {
    private readonly root: Node;

    constructor(
        parent: Node,
        private readonly screenW: number,
        private readonly screenH: number,
        private readonly onSelect: (difficulty: Difficulty) => void,
    ) {
        this.root = makeNode('MenuRoot', parent, 0, 0, screenW, screenH);

        const bg = this.root.addComponent(Graphics);
        bg.fillColor = new Color(5, 3, 10, 250);
        bg.rect(-screenW * 0.5, -screenH * 0.5, screenW, screenH);
        bg.fill();

        addLabel(this.root, 'MenuTitle', '喵音回廊', 58, Theme.cream, 0, screenH * 0.5 - 190, 900, 80);
        addLabel(this.root, 'MenuSub', '选择难度', 24, Theme.cyan, 0, screenH * 0.5 - 255, 900, 44);

        DIFFICULTY_ORDER.forEach((id, index) => {
            this.addButton(LEVELS[id], 80 - index * 118);
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
    }

    dispose(): void {
        if (this.root?.isValid) this.root.destroy();
    }

    private addButton(level: LevelConfig, y: number): void {
        const node = makeNode('Menu_' + level.id, this.root, 0, y, 560, 94);
        const g = node.addComponent(Graphics);
        g.fillColor = new Color(38, 28, 50, 235);
        g.strokeColor = level.id === 'hard' ? Theme.rose : Theme.wall;
        g.lineWidth = 2;
        g.roundRect(-280, -47, 560, 94, 18);
        g.fill();
        g.stroke();

        addLabel(node, 'MenuLabel', `${level.label} · ${level.subtitle}`, 22, Theme.cream, 0, 18, 520, 40);
        addLabel(
            node,
            'MenuDesc',
            `${level.cols}×${level.rows} · ${level.fragments} 块碎片 · ${timeText(level.timeLimit)}`,
            16,
            Theme.dim,
            0,
            -20,
            520,
            32,
        );

        const press = (event: EventTouch | EventMouse): void => {
            event.propagationStopped = true;
            this.onSelect(level.id);
        };
        node.on(Node.EventType.TOUCH_END, press, this);
        node.on(Node.EventType.MOUSE_UP, press, this);
    }
}
