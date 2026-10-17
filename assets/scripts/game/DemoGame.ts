import {
    _decorator,
    Camera,
    Color,
    Component,
    EffectAsset,
    EventKeyboard,
    EventMouse,
    EventTouch,
    Graphics,
    Input,
    input,
    KeyCode,
    Material,
    Node,
    profiler,
    ResolutionPolicy,
    resources,
    sys,
    Tween,
    Vec2,
    Vec4,
    view,
} from 'cc';
import { nowSeed, Rng } from '../core/Rng';
import { ToneSynth } from '../core/ToneSynth';
import { Dir, generateMaze, GridPos, samePos } from './MazeGenerator';
import { MazeModel } from './MazeModel';
import { DemoState, FragmentView, ItemView } from './DemoTypes';
import { MazeRenderer } from './MazeRenderer';
import { PlayerController } from './PlayerController';
import { HudView } from './HudView';
import { ItemContext, ItemSystem } from './ItemSystem';
import { ArtAssets, loadArtAssets } from './ArtAssets';
import { CatView } from './CatView';
import { Difficulty, LEVELS, LevelConfig } from './LevelConfig';
import { MenuView } from './MenuView';
import { makeNode, posKey } from './UiKit';

const { ccclass } = _decorator;

@ccclass('DemoGame')
export class DemoGame extends Component {
    private state: DemoState = 'menu';
    private finale = false;

    private seed = 0;
    private rng!: Rng;
    private model!: MazeModel;
    private renderer!: MazeRenderer;
    private player!: PlayerController;
    private catView: CatView | null = null;
    private art: ArtAssets | null = null;
    private hud!: HudView;
    private readonly itemSystem = new ItemSystem();
    private itemContext!: ItemContext;
    private difficulty: Difficulty = 'normal';
    private level: LevelConfig = LEVELS.normal;
    private menu: MenuView | null = null;

    private screenW = 1080;
    private screenH = 1920;
    private demoRoot: Node | null = null;

    private fogGfx!: Graphics;
    private fogMat: Material | null = null;
    private fogShaderReady = false;
    private guideGfx!: Graphics;
    private trailGfx!: Graphics;

    private exitPos: GridPos | null = null;
    private fragments: FragmentView[] = [];
    private items: ItemView[] = [];

    private collected = 0;
    private timeLeft = 0;
    private elapsed = 0;
    private timerStopped = false;
    private warned60 = false;
    private warned30 = false;

    private firefly = 0;
    private wine = 0;
    private catStrip = 0;
    private yarn = 0;
    private butterflySteps = 0;
    private visitedTrail: GridPos[] = [];

    private touchStart: Vec2 | null = null;
    private hudAcc = 0;
    private readonly tone = new ToneSynth();

    onLoad(): void {
        // Demo uses SHOW_ALL so the portrait board is fully visible in any preview window.
        // Production build should use FIXED_WIDTH + SafeArea.
        if (sys.isBrowser) view.setFrameSize(1080, 1920);
        view.setDesignResolutionSize(1080, 1920, ResolutionPolicy.SHOW_ALL);
        try {
            profiler.hideStats();
        } catch (e) {
            // profiler is optional in release builds.
        }

        const size = view.getVisibleSize();
        this.screenW = size.width;
        this.screenH = size.height;
        const canvasUT = this.node.getComponent('cc.UITransform') as any;
        if (canvasUT) canvasUT.setContentSize(this.screenW, this.screenH);
        this.node.setPosition(this.screenW * 0.5, this.screenH * 0.5, 0);

        const cameraNode = this.node.getChildByName('Camera');
        const camera = cameraNode?.getComponent(Camera);
        if (cameraNode && camera) {
            camera.orthoHeight = this.screenH * 0.5;
            cameraNode.setWorldPosition(this.screenW * 0.5, this.screenH * 0.5, 1000);
        }

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    }

    async start(): Promise<void> {
        try {
            this.art = await loadArtAssets();
        } catch (e) {
            console.warn('[DemoGame] art load failed, using Graphics placeholders', e);
            this.art = null;
        }
        this.openMenu();
    }

    private openMenu(): void {
        this.state = 'menu';
        this.finale = false;
        this.unscheduleAllCallbacks();
        Tween.stopAll();
        if (this.menu) this.menu.dispose();
        this.menu = new MenuView(
            this.node,
            this.screenW,
            this.screenH,
            (difficulty) => this.startLevel(difficulty),
        );
    }

    private startLevel(difficulty: Difficulty): void {
        this.difficulty = difficulty;
        this.level = LEVELS[difficulty];
        if (this.menu) {
            this.menu.dispose();
            this.menu = null;
        }
        this.build();
    }

    onDestroy(): void {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        if (this.menu) this.menu.dispose();
        this.tone.dispose();
        Tween.stopAll();
    }

    update(dt: number): void {
        if (this.state !== 'playing' || this.finale || !this.hud) return;

        this.catView?.update(dt);
        this.elapsed += dt;
        if (!this.timerStopped) {
            this.timeLeft = Math.max(0, this.timeLeft - dt);
            if (this.timeLeft <= 0) {
                this.timeout();
                return;
            }
            if (!this.warned60 && this.timeLeft <= 60) {
                this.warned60 = true;
                if (this.timeLeft > 30) this.hud.toast('还剩 1 分钟。', 2.2);
            }
            if (!this.warned30 && this.timeLeft <= 30) {
                this.warned30 = true;
                this.hud.toast('只剩 30 秒，门还没开。', 2.4);
            }
        }

        const hadFirefly = this.firefly > 0;
        const hadYarn = this.yarn > 0;

        this.firefly = Math.max(0, this.firefly - dt);
        this.wine = Math.max(0, this.wine - dt);
        this.catStrip = Math.max(0, this.catStrip - dt);
        this.yarn = Math.max(0, this.yarn - dt);

        if (hadFirefly && this.firefly <= 0) this.refreshFog();
        if (hadYarn && this.yarn <= 0) {
            this.visitedTrail = [];
            this.refreshGuide();
        }

        this.hudAcc += dt;
        if (this.hudAcc >= 0.1) {
            this.hudAcc = 0;
            this.refreshHud();
        }
    }

    // ---------------------------------------------------------------------
    // Build
    // ---------------------------------------------------------------------

    private build(): void {
        this.unscheduleAllCallbacks();
        Tween.stopAll();
        if (this.hud) this.hud.dispose();

        if (this.demoRoot) {
            this.demoRoot.destroy();
            this.demoRoot = null;
        }

        this.screenW = view.getVisibleSize().width;
        this.screenH = view.getVisibleSize().height;
        this.seed = nowSeed();
        this.rng = new Rng(this.seed);
        this.model = new MazeModel(generateMaze(this.level.cols, this.level.rows, this.seed, 0.05));

        this.state = 'playing';
        this.finale = false;
        this.collected = 0;
        this.timeLeft = this.level.timeLimit;
        this.elapsed = 0;
        this.timerStopped = false;
        this.warned60 = false;
        this.warned30 = false;
        this.firefly = 0;
        this.wine = 0;
        this.catStrip = 0;
        this.yarn = 0;
        this.butterflySteps = 0;
        this.visitedTrail = [];
        this.exitPos = null;
        this.fragments = [];
        this.items = [];
        this.fogMat = null;
        this.fogShaderReady = false;

        this.demoRoot = makeNode('DemoRoot', this.node, 0, 0, this.screenW, this.screenH);
        this.catView = null;
        this.renderer = new MazeRenderer();
        this.renderer.build(this.demoRoot, this.model, this.screenW, this.screenH, this.art);

        const occupied = new Set<string>();
        this.placeFragments(occupied);
        this.items = this.itemSystem.place(
            this.model,
            this.rng,
            occupied,
            this.level.itemCounts,
            (type, pos) => this.renderer.createItemNode(type, pos),
        );

        const playerNode = this.renderer.createPlayerNode();
        this.player = new PlayerController(
            playerNode,
            this.model,
            (p) => this.renderer.cellToLocal(p),
            (p) => this.onArrive(p),
            () => this.tone.click(),
        );
        this.catView = this.art?.cat ? new CatView(playerNode, this.art.cat) : null;
        this.itemContext = this.makeItemContext();

        this.createFogAndGuide();
        this.hud = new HudView(
            this.demoRoot,
            this.screenW,
            this.screenH,
            {
                onDirection: (dir) => this.handleDirection(dir),
                onPause: () => this.togglePause(),
            },
            (cb, delay) => this.scheduleOnce(cb, delay),
        );

        this.refreshFog();
        this.refreshGuide();
        this.refreshHud();
        this.hud.toast(`找到 ${this.level.fragments} 块碎片。集齐后音乐完整，出口才会出现。`, 3.2);
    }

    private placeFragments(occupied: Set<string>): void {
        const start = this.model.data.start;
        const picks: GridPos[] = [];

        const dead = this.model
            .deadEnds()
            .filter((p) => !samePos(p, start))
            .sort((a, b) => this.model.distance(start, b) - this.model.distance(start, a));

        for (const p of dead) {
            if (picks.length >= this.level.fragments) break;
            if (picks.every((q) => this.model.distance(p, q) >= 3)) picks.push(p);
        }

        while (picks.length < this.level.fragments) {
            let p = this.model.randomCell(
                this.rng,
                (q) =>
                    !samePos(q, start) &&
                    !occupied.has(posKey(q)) &&
                    picks.every((r) => this.model.distance(q, r) >= 3),
            );
            if (!p) {
                p = this.model.randomCell(
                    this.rng,
                    (q) => !samePos(q, start) && !occupied.has(posKey(q)),
                );
            }
            if (!p) break;
            picks.push(p);
        }

        this.fragments = [];
        for (const pos of picks) {
            occupied.add(posKey(pos));
            this.fragments.push({
                pos,
                node: this.renderer.createFragmentNode(pos),
                collected: false,
            });
        }
    }

    private createFogAndGuide(): void {
        this.trailGfx = this.renderer.addOverlayGraphics('YarnTrail');
        this.fogGfx = this.renderer.addOverlayGraphics('Fog');
        this.guideGfx = this.renderer.addOverlayGraphics('Guide');
        this.loadFogEffect();
    }

    private loadFogEffect(): void {
        resources.load('effects/fog', EffectAsset, (err, effect) => {
            if (err || !effect || !this.fogGfx) {
                console.warn('[DemoGame] fog shader unavailable, using cell fallback', err);
                return;
            }

            const mat = new Material();
            mat.initialize({ effectAsset: effect });
            this.fogGfx.customMaterial = mat;
            this.fogMat = this.fogGfx.getMaterialInstance(0) || mat;
            this.fogShaderReady = true;

            this.fogGfx.clear();
            this.fogGfx.fillColor = new Color(255, 255, 255, 255);
            this.fogGfx.rect(0, 0, this.renderer.boardW, this.renderer.boardH);
            this.fogGfx.fill();
            this.refreshFog();
        });
    }

    // ---------------------------------------------------------------------
    // Movement / interaction
    // ---------------------------------------------------------------------

    private async tryMove(dir: Dir): Promise<void> {
        if (this.state !== 'playing' || this.finale || this.player.moving) return;
        const actual: Dir = this.wine > 0 ? (((dir + 2) % 4) as Dir) : dir;
        this.catView?.setDirection(actual);
        this.catView?.setMoving(true);
        await this.player.move(actual, this.catStrip > 0 ? 2 : 1);
        this.catView?.setMoving(false);
    }

    private onArrive(next: GridPos): boolean {
        if (this.yarn > 0) {
            this.visitedTrail.push(next);
            if (this.visitedTrail.length > 60) this.visitedTrail.shift();
        }
        if (this.butterflySteps > 0) this.butterflySteps--;

        this.refreshFog();
        this.refreshGuide();
        this.refreshHud();
        return this.processCell();
    }

    private processCell(): boolean {
        for (const f of this.fragments) {
            if (!f.collected && samePos(f.pos, this.player.position)) {
                this.collectFragment(f);
                return true;
            }
        }

        for (const item of this.items) {
            if (!item.used && samePos(item.pos, this.player.position)) {
                this.itemSystem.use(item, this.itemContext);
                return true;
            }
        }

        if (this.exitPos && samePos(this.exitPos, this.player.position)) {
            this.win();
            return true;
        }
        return false;
    }

    private collectFragment(f: FragmentView): void {
        f.collected = true;
        f.node.active = false;
        this.collected++;
        this.tone.pickup(this.collected - 1);
        this.hud.toast(`音轨 ${this.collected}/${this.level.fragments} · 音乐更完整了`, 2.2);
        this.refreshHud();

        if (this.collected >= this.level.fragments) this.startFinale();
    }

    private startFinale(): void {
        if (this.finale || this.state !== 'playing') return;
        this.finale = true;
        this.timerStopped = true;
        this.state = 'finale';
        this.hud.toast('最后一段……', 1.0);

        this.scheduleOnce(() => {
            if (this.state !== 'finale') return;
            this.tone.climax();
            this.clearTemporaryEffects();
            this.spawnExit();
            this.state = 'playing';
            this.finale = false;
            this.hud.toast('整首歌回来了。门开了。', 3.0);
            this.refreshHud();
        }, 1.0);
    }

    private spawnExit(): void {
        const dist = this.model.bfs(this.player.position);
        const candidates: GridPos[] = [];

        for (const cell of this.model.data.cells) {
            const d = dist.get(cell.y * this.model.data.cols + cell.x);
            if (d === undefined || d < 3 || d > 5) continue;
            const p = { x: cell.x, y: cell.y };
            if (!this.isBlockedForExit(p)) candidates.push(p);
        }

        if (candidates.length === 0) {
            for (const cell of this.model.data.cells) {
                const d = dist.get(cell.y * this.model.data.cols + cell.x);
                if (d === undefined || d < 6 || d > 8) continue;
                const p = { x: cell.x, y: cell.y };
                if (!this.isBlockedForExit(p)) candidates.push(p);
            }
        }

        const pos = candidates.length > 0 ? this.rng.pick(candidates) : null;
        if (!pos) {
            this.hud.toast('出口找不到位置，请重开一局', 3);
            return;
        }

        this.exitPos = pos;
        this.renderer.showExit(pos);
        this.refreshGuide();
    }

    private isBlockedForExit(p: GridPos): boolean {
        if (samePos(p, this.player.position)) return true;
        for (const f of this.fragments) {
            if (!f.collected && samePos(f.pos, p)) return true;
        }
        for (const item of this.items) {
            if (!item.used && samePos(item.pos, p)) return true;
        }
        return false;
    }

    private teleport(): void {
        const target = this.model.randomCell(
            this.rng,
            (p) =>
                !samePos(p, this.player.position) &&
                this.model.distance(this.player.position, p) >= 5 &&
                !this.isBlockedForExit(p),
        );
        if (!target) {
            this.hud.toast('下水道堵住了。', 2);
            return;
        }

        this.player.teleport(target);
        this.visitedTrail = [];
        this.refreshFog();
        this.refreshGuide();
        this.refreshHud();
        this.hud.toast('下水道：被冲到了别处。', 2.2);
    }

    // ---------------------------------------------------------------------
    // Effects
    // ---------------------------------------------------------------------

    private makeItemContext(): ItemContext {
        const self = this;
        return {
            get playerPos(): GridPos {
                return self.player.position;
            },
            isTimerStopped: () => self.timerStopped,
            addTime: (seconds) => self.addTime(seconds),
            setFirefly: (seconds) => {
                self.firefly = seconds;
                self.refreshFog();
            },
            setWine: (seconds) => {
                self.wine = seconds;
            },
            setCatStrip: (seconds) => {
                self.catStrip = seconds;
            },
            setButterfly: (steps) => {
                self.butterflySteps = steps;
                self.refreshGuide();
            },
            setYarn: (seconds) => {
                self.yarn = seconds;
                self.visitedTrail = [{ ...self.player.position }];
                self.refreshGuide();
            },
            teleport: () => self.teleport(),
            toast: (text) => self.hud.toast(text, 2.2),
            refreshAll: () => {
                self.refreshFog();
                self.refreshGuide();
                self.refreshHud();
            },
        };
    }

    private addTime(seconds: number): void {
        if (this.timerStopped) return;
        this.timeLeft = Math.max(0, Math.min(this.level.timeLimit + 20, this.timeLeft + seconds));
        if (this.timeLeft <= 0) this.timeout();
    }

    private clearTemporaryEffects(): void {
        this.firefly = 0;
        this.wine = 0;
        this.catStrip = 0;
        this.yarn = 0;
        this.butterflySteps = 0;
        this.visitedTrail = [];
        this.refreshFog();
        this.refreshGuide();
    }

    // ---------------------------------------------------------------------
    // Views
    // ---------------------------------------------------------------------

    private refreshFog(): void {
        const radius = this.firefly > 0 ? 4 : 2;

        if (this.fogShaderReady && this.fogMat) {
            this.fogMat.setProperty(
                'u_player',
                new Vec4(
                    (this.player.position.x + 0.5) * this.renderer.cell,
                    (this.player.position.y + 0.5) * this.renderer.cell,
                    this.renderer.cell,
                    radius,
                ),
            );
            return;
        }

        const limit = (radius + 0.35) * (radius + 0.35);
        this.fogGfx.clear();
        this.fogGfx.fillColor = new Color(5, 3, 10, 255);

        for (const cell of this.model.data.cells) {
            const dx = cell.x - this.player.position.x;
            const dy = cell.y - this.player.position.y;
            if (dx * dx + dy * dy <= limit) continue;
            this.fogGfx.rect(
                cell.x * this.renderer.cell,
                cell.y * this.renderer.cell,
                this.renderer.cell,
                this.renderer.cell,
            );
        }
        this.fogGfx.fill();
    }

    private refreshGuide(): void {
        this.guideGfx.clear();
        this.trailGfx.clear();

        if (this.yarn > 0 && this.visitedTrail.length > 1) {
            this.trailGfx.strokeColor = new Color(201, 106, 122, 150);
            this.trailGfx.lineWidth = 3;
            const first = this.renderer.cellToLocal(this.visitedTrail[0]);
            this.trailGfx.moveTo(first.x, first.y);
            for (let i = 1; i < this.visitedTrail.length; i++) {
                const p = this.renderer.cellToLocal(this.visitedTrail[i]);
                this.trailGfx.lineTo(p.x, p.y);
            }
            this.trailGfx.stroke();
        }

        if (this.exitPos) {
            const p = this.renderer.cellToLocal(this.exitPos);
            this.guideGfx.strokeColor = new Color(143, 211, 214, 170);
            this.guideGfx.lineWidth = 6;
            this.guideGfx.moveTo(p.x, p.y);
            this.guideGfx.lineTo(p.x, this.renderer.boardH + 100);
            this.guideGfx.stroke();
            this.guideGfx.fillColor = new Color(143, 211, 214, 80);
            this.guideGfx.circle(p.x, p.y, this.renderer.cell * 0.42);
            this.guideGfx.fill();
        }

        if (this.butterflySteps > 0) {
            const path = this.butterflyPath();
            if (path.length > 1) {
                const first = this.renderer.cellToLocal(path[0]);
                this.guideGfx.strokeColor = new Color(143, 211, 214, 210);
                this.guideGfx.lineWidth = 4;
                this.guideGfx.moveTo(first.x, first.y);
                const count = Math.min(4, path.length - 1);
                for (let i = 1; i <= count; i++) {
                    const p = this.renderer.cellToLocal(path[i]);
                    this.guideGfx.lineTo(p.x, p.y);
                    this.guideGfx.circle(p.x, p.y, 4);
                }
                this.guideGfx.stroke();
                this.guideGfx.fillColor = new Color(143, 211, 214, 255);
                this.guideGfx.fill();
            }
        }
    }

    private butterflyPath(): GridPos[] {
        let target: GridPos | null = null;
        let best = Number.POSITIVE_INFINITY;

        for (const f of this.fragments) {
            if (f.collected) continue;
            const d = this.model.distance(this.player.position, f.pos);
            if (d < best) {
                best = d;
                target = f.pos;
            }
        }

        if (!target && this.exitPos) target = this.exitPos;
        if (!target) return [];
        return this.model.path(this.player.position, target);
    }

    private refreshHud(): void {
        if (!this.hud) return;

        const effects: string[] = [];
        if (this.firefly > 0) effects.push(`萤火虫 ${this.firefly.toFixed(0)}s`);
        if (this.wine > 0) effects.push(`鲜花酒 ${this.wine.toFixed(0)}s 反向`);
        if (this.catStrip > 0) effects.push(`猫条 ${this.catStrip.toFixed(0)}s ×2`);
        if (this.yarn > 0) effects.push(`毛线球 ${this.yarn.toFixed(0)}s`);
        if (this.butterflySteps > 0) effects.push(`蝴蝶 ${this.butterflySteps}步`);

        this.hud.setStats({
            collected: this.collected,
            total: this.level.fragments,
            exitOpen: !!this.exitPos,
            timeLeft: this.timeLeft,
            elapsed: this.elapsed,
            steps: this.player.steps,
            effects: effects.length > 0 ? effects.join('　') : '无道具效果',
            timerStopped: this.timerStopped,
            seed: this.seed,
            cols: this.level.cols,
            rows: this.level.rows,
            levelLabel: this.level.label,
            timeLimit: this.level.timeLimit,
        });
    }

    // ---------------------------------------------------------------------
    // End states
    // ---------------------------------------------------------------------

    private timeout(): void {
        if (this.state === 'won' || this.state === 'timeout') return;
        this.state = 'timeout';
        this.finale = false;
        this.tone.timeout();
        this.hud.showOverlay(
            '被主人抱回家  ☆☆☆',
            `音轨 ${this.collected}/${this.level.fragments}　用时 ${this.timeText(this.elapsed)}\n主人循着猫叫找到了回廊深处。`,
            '按 R 重开　M 选难度　或点击屏幕再试一次',
        );
    }

    private win(): void {
        if (this.state === 'won' || this.state === 'timeout') return;
        this.state = 'won';
        this.finale = false;
        this.tone.climax();

        const ratio = this.timeLeft / this.level.timeLimit;
        const stars = ratio >= 0.4 ? 3 : ratio >= 0.15 ? 2 : 1;
        const starText = '★'.repeat(stars) + '☆'.repeat(3 - stars);

        this.hud.showOverlay(
            `带回家了  ${starText}`,
            `音轨 ${this.collected}/${this.level.fragments}　步数 ${this.player.steps}　用时 ${this.timeText(this.elapsed)}\n主人把 CD 放进了唱机。`,
            '按 R 重开　M 选难度　或点击屏幕再走一次',
        );
    }

    private togglePause(): void {
        if (this.state === 'playing' && !this.finale) {
            this.state = 'paused';
            this.hud.showOverlay('暂停', '倒计时与道具效果已冻结。', '按 P 继续　R 重开');
        } else if (this.state === 'paused') {
            this.state = 'playing';
            this.hud.hideOverlay();
        }
    }

    private restart(): void {
        this.build();
    }

    private debugCollectAll(): void {
        if (this.state !== 'playing') return;
        for (const f of this.fragments) {
            if (f.collected) continue;
            f.collected = true;
            f.node.active = false;
            this.collected++;
            this.tone.pickup(this.collected - 1);
        }
        this.refreshHud();
        if (this.collected >= this.level.fragments) this.startFinale();
    }

    private debugSubtractTime(): void {
        if (this.state !== 'playing') return;
        this.timeLeft = Math.max(0, this.timeLeft - 30);
        if (this.timeLeft <= 0) this.timeout();
        else this.hud.toast('调试：剩余时间 -30 秒', 1.5);
    }

    private timeText(seconds: number): string {
        const s = Math.max(0, Math.ceil(seconds));
        const m = Math.floor(s / 60);
        const r = s % 60;
        return `${m < 10 ? '0' : ''}${m}:${r < 10 ? '0' : ''}${r}`;
    }

    // ---------------------------------------------------------------------
    // Input
    // ---------------------------------------------------------------------

    private handleDirection(dir: Dir): void {
        if (this.state === 'menu') return;
        if (this.state === 'won' || this.state === 'timeout') {
            this.restart();
            return;
        }
        if (this.state === 'paused') {
            this.togglePause();
            return;
        }
        if (this.state !== 'playing' || this.finale) return;
        this.touchStart = null;
        void this.tryMove(dir);
    }

    private onKeyDown(event: EventKeyboard): void {
        const key = event.keyCode;

        if (this.state === 'menu') {
            if (key === KeyCode.DIGIT_1 || key === KeyCode.NUM_1) this.startLevel('easy');
            else if (key === KeyCode.DIGIT_2 || key === KeyCode.NUM_2) this.startLevel('normal');
            else if (key === KeyCode.DIGIT_3 || key === KeyCode.NUM_3) this.startLevel('hard');
            return;
        }

        if (key === KeyCode.KEY_M) {
            this.openMenu();
            return;
        }
        if (key === KeyCode.KEY_R) {
            this.restart();
            return;
        }
        if (key === KeyCode.KEY_P) {
            this.togglePause();
            return;
        }
        if (key === KeyCode.KEY_C) {
            this.debugCollectAll();
            return;
        }
        if (key === KeyCode.KEY_T) {
            this.debugSubtractTime();
            return;
        }
        if (this.state === 'won' || this.state === 'timeout') return;
        if (this.state !== 'playing' || this.finale) return;

        if (key === KeyCode.ARROW_UP || key === KeyCode.KEY_W) void this.tryMove(0);
        else if (key === KeyCode.ARROW_RIGHT || key === KeyCode.KEY_D) void this.tryMove(1);
        else if (key === KeyCode.ARROW_DOWN || key === KeyCode.KEY_S) void this.tryMove(2);
        else if (key === KeyCode.ARROW_LEFT || key === KeyCode.KEY_A) void this.tryMove(3);
    }

    private onTouchStart(event: EventTouch): void {
        this.touchStart = event.getUILocation();
    }

    private onTouchEnd(event: EventTouch): void {
        const start = this.touchStart;
        if (!start) return;
        this.touchStart = null;
        this.handlePointerEnd(start, event.getUILocation());
    }

    private onMouseDown(event: EventMouse): void {
        this.touchStart = event.getUILocation();
    }

    private onMouseUp(event: EventMouse): void {
        const start = this.touchStart;
        if (!start) return;
        this.touchStart = null;
        this.handlePointerEnd(start, event.getUILocation());
    }

    private handlePointerEnd(start: Vec2, end: Vec2): void {
        if (this.state === 'won' || this.state === 'timeout') {
            this.restart();
            return;
        }
        if (this.state === 'paused') {
            this.togglePause();
            return;
        }
        if (this.state !== 'playing' || this.finale) return;

        const dx = end.x - start.x;
        const dy = end.y - start.y;
        if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
        if (Math.abs(dx) > Math.abs(dy)) {
            void this.tryMove(dx > 0 ? 1 : 3);
        } else {
            void this.tryMove(dy > 0 ? 0 : 2);
        }
    }
}
