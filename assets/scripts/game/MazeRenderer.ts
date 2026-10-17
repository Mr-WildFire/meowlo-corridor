import { Color, Graphics, Node, Sprite, UITransform } from 'cc';
import { ArtAssets } from './ArtAssets';
import { GridPos } from './MazeGenerator';
import { MazeModel } from './MazeModel';
import { ItemType } from './DemoTypes';
import { ITEM_META } from './ItemSystem';
import { addGraphics, addLabel, makeNode, Theme } from './UiKit';

/**
 * Owns static maze visuals and entity view nodes.
 * It does not know about timing, items or game state.
 * ArtAssets is optional: each missing frame keeps the Graphics placeholder.
 */
export class MazeRenderer {
    screenW = 1080;
    screenH = 1920;
    cell = 64;
    boardW = 0;
    boardH = 0;
    boardX = 0;
    boardY = 0;

    demoRoot!: Node;
    boardRoot!: Node;
    private exitNode: Node | null = null;
    private art: ArtAssets | null = null;

    build(demoRoot: Node, model: MazeModel, screenW: number, screenH: number, art: ArtAssets | null): void {
        this.demoRoot = demoRoot;
        this.screenW = screenW;
        this.screenH = screenH;
        this.art = art;

        this.cell = Math.min(
            64,
            Math.floor((screenW - 100) / model.data.cols),
            Math.floor((screenH - 430) / model.data.rows),
        );
        this.cell = Math.max(38, this.cell);
        this.boardW = model.data.cols * this.cell;
        this.boardH = model.data.rows * this.cell;
        this.boardX = -this.boardW * 0.5;
        this.boardY = -20 - this.boardH * 0.5;

        this.drawBackground();
        this.createBoard(model);
    }

    cellToLocal(p: GridPos): { x: number; y: number } {
        return {
            x: (p.x + 0.5) * this.cell,
            y: (p.y + 0.5) * this.cell,
        };
    }

    addOverlayGraphics(name: string): Graphics {
        return addGraphics(this.demoRoot, name, this.boardX, this.boardY, this.boardW, this.boardH);
    }

    createFragmentNode(pos: GridPos): Node {
        if (this.art?.fragment) {
            const n = makeNode('Fragment', this.boardRoot, 0, 0, this.cell * 0.9, this.cell * 0.9);
            const s = n.addComponent(Sprite);
            s.spriteFrame = this.art.fragment;
            s.sizeMode = Sprite.SizeMode.CUSTOM;
            s.type = Sprite.Type.SIMPLE;
            s.trim = false;
            n.setPosition(this.cellToLocal(pos).x, this.cellToLocal(pos).y, 0);
            return n;
        }

        const n = makeNode('Fragment', this.boardRoot, 0, 0, this.cell, this.cell);
        const g = n.addComponent(Graphics);
        g.fillColor = new Color(143, 211, 214, 45);
        g.circle(0, 0, this.cell * 0.36);
        g.fill();
        g.fillColor = Theme.cyan;
        g.circle(0, 0, this.cell * 0.2);
        g.fill();
        addLabel(n, 'FragmentLabel', '音', 12, Theme.ink, 0, 0, this.cell, this.cell);
        n.setPosition(this.cellToLocal(pos).x, this.cellToLocal(pos).y, 0);
        return n;
    }

    createItemNode(type: ItemType, pos: GridPos): Node {
        if (this.art?.items[type]) {
            const n = makeNode('Item_' + type, this.boardRoot, 0, 0, this.cell * 0.78, this.cell * 0.78);
            const s = n.addComponent(Sprite);
            s.spriteFrame = this.art.items[type]!;
            s.sizeMode = Sprite.SizeMode.CUSTOM;
            s.type = Sprite.Type.SIMPLE;
            s.trim = false;
            n.setPosition(this.cellToLocal(pos).x, this.cellToLocal(pos).y, 0);
            return n;
        }

        const meta = ITEM_META[type];
        const n = makeNode('Item_' + type, this.boardRoot, 0, 0, this.cell, this.cell);
        const g = n.addComponent(Graphics);
        g.fillColor = new Color(meta.color.r, meta.color.g, meta.color.b, 45);
        g.circle(0, 0, this.cell * 0.32);
        g.fill();
        g.fillColor = meta.color;
        g.circle(0, 0, this.cell * 0.17);
        g.fill();
        addLabel(n, 'ItemLabel', meta.label, 11, Theme.ink, 0, 0, this.cell, this.cell);
        n.setPosition(this.cellToLocal(pos).x, this.cellToLocal(pos).y, 0);
        return n;
    }

    createPlayerNode(): Node {
        if (this.art?.cat) {
            const n = makeNode('Player', this.boardRoot, 0, 0, this.cell * 1.1, this.cell * 1.1);
            const s = n.addComponent(Sprite);
            s.spriteFrame = this.art.cat.down[0];
            s.sizeMode = Sprite.SizeMode.CUSTOM;
            s.type = Sprite.Type.SIMPLE;
            s.trim = false;
            return n;
        }

        const n = makeNode('Player', this.boardRoot, 0, 0, this.cell, this.cell);
        const g = n.addComponent(Graphics);
        g.fillColor = Theme.amber;
        g.circle(0, 0, this.cell * 0.28);
        g.fill();
        g.strokeColor = new Color(255, 236, 190, 255);
        g.lineWidth = 2;
        g.circle(0, 0, this.cell * 0.28);
        g.stroke();
        addLabel(n, 'PlayerLabel', '八', 14, Theme.ink, 0, 0, this.cell, this.cell);
        return n;
    }

    showExit(pos: GridPos): void {
        if (!this.exitNode) return;
        this.exitNode.setPosition(this.cellToLocal(pos).x, this.cellToLocal(pos).y, 0);
        this.exitNode.active = true;
    }

    hideExit(): void {
        if (this.exitNode) this.exitNode.active = false;
    }

    private drawBackground(): void {
        const g = addGraphics(this.demoRoot, 'Background', 0, 0, this.screenW, this.screenH);
        g.fillColor = Theme.bg;
        g.rect(-this.screenW * 0.5, -this.screenH * 0.5, this.screenW, this.screenH);
        g.fill();
    }

    private createBoard(model: MazeModel): void {
        this.boardRoot = makeNode(
            'Board',
            this.demoRoot,
            this.boardX,
            this.boardY,
            this.boardW,
            this.boardH,
        );

        if (this.art?.floor) {
            const floor = makeNode('Floor', this.boardRoot, 0, 0, this.boardW, this.boardH);
            floor.getComponent(UITransform)!.setAnchorPoint(0, 0);
            const s = floor.addComponent(Sprite);
            s.spriteFrame = this.art.floor;
            s.sizeMode = Sprite.SizeMode.CUSTOM;
            s.type = Sprite.Type.SIMPLE;
            s.trim = false;
        } else {
            const floor = addGraphics(this.boardRoot, 'Floor', 0, 0, this.boardW, this.boardH);
            floor.fillColor = Theme.floor;
            floor.rect(0, 0, this.boardW, this.boardH);
            floor.fill();
            floor.strokeColor = Theme.floorEdge;
            floor.lineWidth = 2;
            floor.rect(0, 0, this.boardW, this.boardH);
            floor.stroke();
        }

        if (this.art?.wall) {
            this.createWallSprites(model);
        } else {
            this.createFallbackWalls(model);
        }

        // Thin frame stays above floor/walls in both paths.
        const border = addGraphics(this.boardRoot, 'Border', 0, 0, this.boardW, this.boardH);
        border.strokeColor = Theme.floorEdge;
        border.lineWidth = 2;
        border.rect(0, 0, this.boardW, this.boardH);
        border.stroke();

        addLabel(
            this.boardRoot,
            'Entry',
            '入口',
            12,
            Theme.dim,
            this.cell * 0.5,
            this.cell * 0.5,
            this.cell,
            this.cell,
        );

        const exit = makeNode('Exit', this.boardRoot, 0, 0, this.cell * 1.2, this.cell * 1.2);
        if (this.art?.exit) {
            const s = exit.addComponent(Sprite);
            s.spriteFrame = this.art.exit;
            s.sizeMode = Sprite.SizeMode.CUSTOM;
            s.type = Sprite.Type.SIMPLE;
            s.trim = false;
        } else {
            const eg = exit.addComponent(Graphics);
            eg.fillColor = new Color(143, 211, 214, 60);
            eg.circle(0, 0, this.cell * 0.38);
            eg.fill();
            eg.strokeColor = Theme.cyan;
            eg.lineWidth = 3;
            eg.circle(0, 0, this.cell * 0.3);
            eg.stroke();
            addLabel(exit, 'ExitLabel', '门', 16, Theme.cyan, 0, 0, this.cell, this.cell);
        }
        exit.active = false;
        this.exitNode = exit;
    }

    private createFallbackWalls(model: MazeModel): void {
        const walls = addGraphics(this.boardRoot, 'Walls', 0, 0, this.boardW, this.boardH);
        walls.strokeColor = Theme.wall;
        walls.lineWidth = 6;

        for (const cell of model.data.cells) {
            const x = cell.x * this.cell;
            const y = cell.y * this.cell;
            if (cell.walls[0]) {
                walls.moveTo(x, y + this.cell);
                walls.lineTo(x + this.cell, y + this.cell);
            }
            if (cell.walls[1]) {
                walls.moveTo(x + this.cell, y);
                walls.lineTo(x + this.cell, y + this.cell);
            }
            if (cell.walls[2]) {
                walls.moveTo(x, y);
                walls.lineTo(x + this.cell, y);
            }
            if (cell.walls[3]) {
                walls.moveTo(x, y);
                walls.lineTo(x, y + this.cell);
            }
        }
        walls.stroke();
    }

    private createWallSprites(model: MazeModel): void {
        const thickness = Math.max(10, Math.round(this.cell * 0.18));

        for (const cell of model.data.cells) {
            const x = cell.x * this.cell;
            const y = cell.y * this.cell;
            if (cell.walls[0]) this.addWall(x + this.cell * 0.5, y + this.cell, 0, thickness);
            if (cell.walls[1]) this.addWall(x + this.cell, y + this.cell * 0.5, 90, thickness);
            if (cell.walls[2]) this.addWall(x + this.cell * 0.5, y, 0, thickness);
            if (cell.walls[3]) this.addWall(x, y + this.cell * 0.5, 90, thickness);
        }
    }

    private addWall(cx: number, cy: number, angle: number, thickness: number): void {
        if (!this.art?.wall) return;
        const n = makeNode('Wall', this.boardRoot, cx, cy, this.cell, thickness);
        const s = n.addComponent(Sprite);
        s.spriteFrame = this.art.wall;
        s.sizeMode = Sprite.SizeMode.CUSTOM;
        s.type = Sprite.Type.SIMPLE;
        s.trim = false;
        n.angle = angle;
    }
}
