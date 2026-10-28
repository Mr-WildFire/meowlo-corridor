import { Color, Graphics, Label, Layers, Node, UITransform } from 'cc';
import { UiFonts } from './UiFonts';

/** Global UI text scale: feedback and HUD labels were too small at 1080p. */
const UI_TEXT_SCALE = 1.2;

export const Theme = {
    bg: new Color(11, 9, 18, 255),
    floor: new Color(26, 19, 34, 255),
    floorEdge: new Color(55, 42, 66, 255),
    wall: new Color(216, 178, 122, 255),
    fog: new Color(5, 3, 10, 255),
    cream: new Color(243, 231, 211, 255),
    dim: new Color(170, 158, 145, 255),
    amber: new Color(242, 179, 92, 255),
    cyan: new Color(143, 211, 214, 255),
    rose: new Color(201, 106, 122, 255),
    mint: new Color(159, 224, 192, 255),
    violet: new Color(183, 154, 224, 255),
    ink: new Color(28, 20, 16, 255),
};

export function makeNode(
    name: string,
    parent: Node,
    x: number,
    y: number,
    w = 0,
    h = 0,
): Node {
    const n = new Node(name);
    n.parent = parent;
    n.layer = Layers.Enum.UI_2D;
    n.setPosition(x, y, 0);
    const ut = n.addComponent(UITransform);
    if (w > 0 || h > 0) ut.setContentSize(w, h);
    return n;
}

export function addGraphics(
    parent: Node,
    name: string,
    x: number,
    y: number,
    w: number,
    h: number,
): Graphics {
    const n = makeNode(name, parent, x, y, w, h);
    // Graphics draws in local coordinates starting at the node origin.
    n.getComponent(UITransform)!.setAnchorPoint(0, 0);
    return n.addComponent(Graphics);
}

export function addLabel(
    parent: Node,
    name: string,
    text: string,
    fontSize: number,
    color: Color,
    x: number,
    y: number,
    width = 900,
    height = 60,
): Label {
    const n = makeNode(name, parent, x, y, width, height);
    const label = n.addComponent(Label);
    label.string = text;
    const scaledSize = Math.round(fontSize * UI_TEXT_SCALE);
    label.fontSize = scaledSize;
    label.lineHeight = Math.round(scaledSize * 1.25);
    label.color = color;
    label.horizontalAlign = Label.HorizontalAlign.CENTER;
    label.verticalAlign = Label.VerticalAlign.CENTER;
    label.overflow = Label.Overflow.NONE;
    UiFonts.apply(label);
    return label;
}

export function timeText(seconds: number): string {
    const s = Math.max(0, Math.ceil(seconds));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m < 10 ? '0' : ''}${m}:${r < 10 ? '0' : ''}${r}`;
}

export function posKey(p: { x: number; y: number }): string {
    return `${p.x},${p.y}`;
}
