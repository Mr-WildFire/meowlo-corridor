import { Color, Graphics, Label, Node, Sprite, SpriteFrame, Tween, tween, UITransform, Vec3 } from 'cc';
import { locale } from '../core/Locale';
import { Theme, addLabel, makeNode } from './UiKit';
import { UiFonts } from './UiFonts';

/**
 * Short CD assembly cinematic after the last fragment.
 * Shards fly into a disc, then the caller owns the existing 1s-silence ->
 * climax -> exit timing via the three callbacks.
 */
export class FinaleView {
    private readonly root: Node;
    private readonly title: Label;
    private readonly subtitle: Label;
    private readonly cdNode: Node;
    private readonly timers: Array<ReturnType<typeof setTimeout>> = [];
    private readonly shardNodes: Node[] = [];

    constructor(
        parent: Node,
        private readonly screenW: number,
        private readonly screenH: number,
        cdFrame: SpriteFrame | null,
        private readonly onAssembled: () => void,
        private readonly onClimax: () => void,
        private readonly onFinished: () => void,
    ) {
        this.root = makeNode('FinaleRoot', parent, 0, 0, screenW, screenH);
        const bg = this.root.addComponent(Graphics);
        bg.fillColor = new Color(3, 2, 7, 225);
        bg.rect(-screenW * 0.5, -screenH * 0.5, screenW, screenH);
        bg.fill();

        addLabel(this.root, 'FinaleKicker', 'CD', 18, Theme.cyan, 0, 500, 400, 30);
        this.title = addLabel(this.root, 'FinaleTitle', locale.t('fragment.final'), 38, Theme.cream, 0, 430, 980, 60);
        UiFonts.titleLabel(this.title);
        this.subtitle = addLabel(this.root, 'FinaleSub', locale.t('finale.subtitle'), 20, Theme.dim, 0, 365, 980, 40);

        this.cdNode = makeNode('FinaleCD', this.root, 0, 40, 300, 300);
        this.cdNode.active = false;
        const halo = makeNode('FinaleHalo', this.cdNode, 0, 0, 360, 360);
        const hg = halo.addComponent(Graphics);
        hg.strokeColor = new Color(143, 211, 214, 100);
        hg.lineWidth = 3;
        hg.circle(0, 0, 168);
        hg.stroke();
        hg.strokeColor = new Color(143, 211, 214, 45);
        hg.circle(0, 0, 185);
        hg.stroke();

        if (cdFrame) {
            const spr = this.cdNode.addComponent(Sprite);
            spr.sizeMode = Sprite.SizeMode.CUSTOM;
            spr.trim = false;
            spr.spriteFrame = cdFrame;
            this.cdNode.getComponent(UITransform)!.setContentSize(300, 300);
        } else {
            const g = this.cdNode.addComponent(Graphics);
            g.fillColor = new Color(18, 22, 30, 255);
            g.strokeColor = Theme.cyan;
            g.lineWidth = 4;
            g.circle(0, 0, 140);
            g.fill();
            g.stroke();
            g.fillColor = new Color(8, 12, 18, 255);
            g.circle(0, 0, 28);
            g.fill();
        }
    }

    /** positions are Canvas-local coordinates. */
    play(positions: Vec3[], fragmentCount: number): void {
        const count = Math.max(positions.length, fragmentCount);
        for (let i = 0; i < count; i++) {
            const p = positions[i] ?? new Vec3(
                Math.cos((Math.PI * 2 * i) / count) * 430,
                Math.sin((Math.PI * 2 * i) / count) * 360,
                0,
            );
            const shard = makeNode('FinaleShard' + i, this.root, p.x, p.y, 56, 56);
            const g = shard.addComponent(Graphics);
            g.fillColor = new Color(214, 250, 248, 245);
            g.strokeColor = new Color(84, 180, 188, 255);
            g.lineWidth = 2;
            g.moveTo(0, -22);
            g.lineTo(18, -2);
            g.lineTo(8, 22);
            g.lineTo(-12, 14);
            g.lineTo(-18, -8);
            g.close();
            g.fill();
            g.stroke();
            this.shardNodes.push(shard);
            tween(shard)
                .delay(i * 0.055)
                .to(0.8, {
                    position: new Vec3(0, 40, 0),
                    scale: new Vec3(0.25, 0.25, 1),
                    angle: 220 + i * 40,
                }, { easing: 'quadIn' })
                .call(() => { shard.active = false; })
                .start();
        }

        this.timers.push(setTimeout(() => {
            if (!this.root.isValid) return;
            this.onAssembled();
            this.title.string = locale.t('finale.silence');
            this.subtitle.string = locale.t('finale.subtitle');
            this.cdNode.active = true;
            this.cdNode.setScale(0.45, 0.45, 1);
            tween(this.cdNode)
                .to(0.45, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
                .start();
        }, 1050));

        this.timers.push(setTimeout(() => {
            if (!this.root.isValid) return;
            this.onClimax();
            this.title.string = locale.t('finale.done');
            this.subtitle.string = locale.t('finale.hint');
            tween(this.cdNode)
                .to(0.18, { scale: new Vec3(1.08, 1.08, 1) }, { easing: 'quadOut' })
                .to(0.45, { scale: new Vec3(1, 1, 1) }, { easing: 'quadIn' })
                .start();
        }, 2100));

        this.timers.push(setTimeout(() => {
            if (!this.root.isValid) return;
            this.onFinished();
            this.dispose();
        }, 3150));
    }

    dispose(): void {
        for (const t of this.timers) clearTimeout(t);
        this.timers.length = 0;
        for (const n of this.shardNodes) {
            if (n.isValid) Tween.stopAllByTarget(n);
        }
        if (this.cdNode?.isValid) Tween.stopAllByTarget(this.cdNode);
        if (this.root?.isValid) this.root.destroy();
    }
}
