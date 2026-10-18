import { Color, EffectAsset, Graphics, Material, resources, Vec4 } from 'cc';
import { GridPos } from './MazeGenerator';
import { MazeModel } from './MazeModel';

/**
 * 2-cell soft fog. Prefers the custom effect, falls back to per-cell black rects.
 * The shader is a Graphics quad so it needs no texture/white sprite.
 */
export class FogView {
    private readonly fallbackColor = new Color(5, 3, 10, 255);
    private mat: Material | null = null;
    private shaderReady = false;
    private target: GridPos = { x: 0, y: 0 };
    private radius = 2;

    constructor(
        private readonly gfx: Graphics,
        private readonly model: MazeModel,
        private readonly cell: number,
        private readonly boardW: number,
        private readonly boardH: number,
    ) {
        this.refresh();
    }

    loadEffect(): void {
        resources.load('effects/fog', EffectAsset, (err, effect) => {
            if (err || !effect || !this.gfx?.isValid) {
                console.warn('[FogView] shader unavailable, using cell fallback', err);
                return;
            }

            const mat = new Material();
            mat.initialize({ effectAsset: effect });
            this.gfx.customMaterial = mat;
            this.mat = this.gfx.getMaterialInstance(0) || mat;
            this.shaderReady = true;
            this.gfx.clear();
            this.gfx.fillColor = new Color(255, 255, 255, 255);
            this.gfx.rect(0, 0, this.boardW, this.boardH);
            this.gfx.fill();
            this.refresh();
        });
    }

    setTarget(target: GridPos, radius: number): void {
        this.target = target;
        this.radius = radius;
        this.refresh();
    }

    dispose(): void {
        this.mat = null;
        this.shaderReady = false;
    }

    private refresh(): void {
        if (this.shaderReady && this.mat) {
            this.mat.setProperty(
                'u_player',
                new Vec4(
                    (this.target.x + 0.5) * this.cell,
                    (this.target.y + 0.5) * this.cell,
                    this.cell,
                    this.radius,
                ),
            );
            return;
        }

        const limit = (this.radius + 0.35) * (this.radius + 0.35);
        this.gfx.clear();
        this.gfx.fillColor = this.fallbackColor;

        for (const cell of this.model.data.cells) {
            const dx = cell.x - this.target.x;
            const dy = cell.y - this.target.y;
            if (dx * dx + dy * dy <= limit) continue;
            this.gfx.rect(cell.x * this.cell, cell.y * this.cell, this.cell, this.cell);
        }
        this.gfx.fill();
    }
}
