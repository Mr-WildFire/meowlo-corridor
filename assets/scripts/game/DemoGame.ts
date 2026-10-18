import {
    _decorator,
    Camera,
    Component,
    Node,
    profiler,
    ResolutionPolicy,
    sys,
    tween,
    Tween,
    Vec3,
    view,
} from 'cc';
import { AudioDirector } from '../core/AudioDirector';
import { locale, Language } from '../core/Locale';
import { ProgressStore } from '../core/ProgressStore';
import { nowSeed, Rng } from '../core/Rng';
import { SfxDirector } from '../core/SfxDirector';
import { VibrationService } from '../core/VibrationService';
import { ToneSynth } from '../core/ToneSynth';
import { Dir, generateMaze, GridPos, samePos } from './MazeGenerator';
import { MazeModel } from './MazeModel';
import { DemoState, FragmentView, ItemType, ItemView } from './DemoTypes';
import { MazeRenderer } from './MazeRenderer';
import { PlayerController } from './PlayerController';
import { HudView } from './HudView';
import { ItemContext, ItemSystem } from './ItemSystem';
import { ArtAssets, loadArtAssets } from './ArtAssets';
import { CatView } from './CatView';
import { FinaleView } from './FinaleView';
import { FogView } from './FogView';
import { GuideView } from './GuideView';
import { InputRouter } from './InputRouter';
import { Difficulty, LEVELS, LevelConfig } from './LevelConfig';
import { MenuView } from './MenuView';
import { SettingsView } from './SettingsView';
import { makeNode, posKey } from './UiKit';

const { ccclass } = _decorator;

@ccclass('DemoGame')
export class DemoGame extends Component {
    private state: DemoState = 'menu';
    private finale = false;
    private ending = false;

    private seed = 0;
    private rng!: Rng;
    private model!: MazeModel;
    private renderer!: MazeRenderer;
    private player!: PlayerController;
    private catView: CatView | null = null;
    private art: ArtAssets | null = null;
    private hud!: HudView;
    private fog!: FogView;
    private guide!: GuideView;
    private inputRouter!: InputRouter;
    private readonly itemSystem = new ItemSystem();
    private itemContext!: ItemContext;
    private difficulty: Difficulty = 'normal';
    private level: LevelConfig = LEVELS.normal;
    private menu: MenuView | null = null;

    private screenW = 1080;
    private screenH = 1920;
    private safeTop = 0;
    private safeBottom = 0;
    private safeLeft = 0;
    private safeRight = 0;
    private demoRoot: Node | null = null;

    private exitPos: GridPos | null = null;
    private fragments: FragmentView[] = [];
    private items: ItemView[] = [];

    private collected = 0;
    private timeLeft = 0;
    private elapsed = 0;
    private timerStopped = false;
    private warned60 = false;
    private warned30 = false;
    private readonly seenItems = new Set<ItemType>();

    private firefly = 0;
    private wine = 0;
    private catStrip = 0;
    private yarn = 0;
    private butterflySteps = 0;
    private visitedTrail: GridPos[] = [];

    private hudAcc = 0;
    private readonly tone = new ToneSynth();
    private readonly music = new AudioDirector();
    private readonly progress = new ProgressStore();
    private readonly vibration = new VibrationService();
    private sfx: SfxDirector | null = null;
    private language: Language = 'zh';
    private muted = false;
    private volume = 0.7;
    private settings: SettingsView | null = null;
    private settingsWasPlaying = false;
    private finaleView: FinaleView | null = null;

    onLoad(): void {
        // Browser-only viewport override for reproducing tall phones in DevTools.
        if (sys.isBrowser) {
            const params = new URLSearchParams(location.search);
            const fw = Number(params.get('w'));
            const fh = Number(params.get('h'));
            if (fw > 0 && fh > 0) view.setFrameSize(fw, fh);
        }
        // Landscape/16:9 would letterbox; tall phones need the extra height,
        // otherwise the board/HUD are cropped. FIXED_WIDTH keeps the 1080
        // design width and lets the visible height grow with the device.
        view.setDesignResolutionSize(1080, 1920, ResolutionPolicy.FIXED_WIDTH);
        try {
            profiler.hideStats();
        } catch (e) {
            // profiler is optional in release builds.
        }

        const size = view.getVisibleSize();
        this.screenW = size.width;
        this.screenH = size.height;
        try {
            const safe = sys.getSafeAreaRect();
            this.safeBottom = Math.max(0, safe.y);
            this.safeTop = Math.max(0, this.screenH - (safe.y + safe.height));
            this.safeLeft = Math.max(0, safe.x);
            this.safeRight = Math.max(0, this.screenW - (safe.x + safe.width));
        } catch {
            this.safeTop = 0;
            this.safeBottom = 0;
            this.safeLeft = 0;
            this.safeRight = 0;
        }
        const canvasUT = this.node.getComponent('cc.UITransform') as any;
        if (canvasUT) canvasUT.setContentSize(this.screenW, this.screenH);
        this.node.setPosition(this.screenW * 0.5, this.screenH * 0.5, 0);

        const cameraNode = this.node.getChildByName('Camera');
        const camera = cameraNode?.getComponent(Camera);
        if (cameraNode && camera) {
            camera.orthoHeight = this.screenH * 0.5;
            cameraNode.setWorldPosition(this.screenW * 0.5, this.screenH * 0.5, 1000);
        }

        this.inputRouter = new InputRouter({
            onDirection: (dir) => this.handleDirection(dir),
            onPause: () => this.togglePause(),
            onMute: () => this.toggleMute(),
            onSettings: () => this.openSettings(),
            onRestart: () => this.restart(),
            onMenu: () => this.openMenu(),
            onDifficulty: (difficulty) => {
                if (this.state === 'menu') this.startLevel(difficulty);
            },
            onDebugCollect: () => this.debugCollectAll(),
            onDebugTime: () => this.debugSubtractTime(),
            onTap: () => this.handleTap(),
        });
    }

    async start(): Promise<void> {
        try {
            this.art = await loadArtAssets();
        } catch (e) {
            console.warn('[DemoGame] art load failed, using Graphics placeholders', e);
            this.art = null;
        }

        try {
            await this.music.load(this.node);
        } catch (e) {
            console.warn('[DemoGame] audio load failed, using procedural fallback', e);
        }
        this.muted = this.progress.muted;
        this.volume = this.progress.volume;
        this.language = this.progress.language;
        locale.setLanguage(this.language);
        this.vibration.setEnabled(this.progress.vibration);
        this.sfx = new SfxDirector(this.node);
        this.sfx.setMuted(this.muted);
        this.sfx.setVolume(this.volume);
        void this.sfx.load();

        this.music.setMuted(this.muted);
        this.music.setVolume(this.volume);
        this.tone.setMuted(this.muted);
        this.tone.setVolume(this.volume);
        this.openMenu();
    }

    private openMenu(): void {
        if (this.state === 'finale') return;
        if (this.state === 'menu' && this.menu) return;
        if (this.settings) {
            this.settings.dispose();
            this.settings = null;
        }
        this.state = 'menu';
        this.finale = false;
        this.ending = false;
        this.unscheduleAllCallbacks();
        Tween.stopAll();
        this.music.stop();
        // Hide the frozen run behind the opaque menu instead of showing ghost HUD text.
        if (this.demoRoot) this.demoRoot.active = false;
        if (this.menu) this.menu.dispose();
        this.menu = new MenuView(
            this.node,
            this.screenW,
            this.screenH,
            this.progress.allBest(),
            this.muted,
            (difficulty) => this.startLevel(difficulty),
            () => this.toggleMute(),
            () => this.openSettings(),
        );
    }

    private startLevel(difficulty: Difficulty): void {
        this.sfx?.click();
        this.difficulty = difficulty;
        this.level = LEVELS[difficulty];
        if (this.menu) {
            this.menu.dispose();
            this.menu = null;
        }
        this.build();
    }

    onDestroy(): void {
        this.inputRouter?.dispose();
        this.settings?.dispose();
        this.settings = null;
        this.finaleView?.dispose();
        this.finaleView = null;
        this.fog?.dispose();
        this.guide?.dispose();
        if (this.menu) this.menu.dispose();
        this.music.dispose();
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
                if (this.timeLeft > 30) this.hud.toast(locale.t('game.warn60'), 2.2);
            }
            if (!this.warned30 && this.timeLeft <= 30) {
                this.warned30 = true;
                this.hud.toast(locale.t('game.warn30'), 2.4);
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
        if (this.settings) {
            this.settings.dispose();
            this.settings = null;
        }
        if (this.finaleView) {
            this.finaleView.dispose();
            this.finaleView = null;
        }
        this.unscheduleAllCallbacks();
        Tween.stopAll();
        this.music.stop();
        if (this.hud) this.hud.dispose();

        if (this.demoRoot) {
            this.demoRoot.destroy();
            this.demoRoot = null;
        }

        this.screenW = view.getVisibleSize().width;
        this.screenH = view.getVisibleSize().height;
        this.seed = nowSeed();
        this.rng = new Rng(this.seed);
        this.model = new MazeModel(
            generateMaze(this.level.cols, this.level.rows, this.seed, this.level.braid),
        );

        this.state = 'playing';
        this.finale = false;
        this.ending = false;
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
            this.safeTop,
            this.safeBottom,
            this.safeLeft,
            this.safeRight,
            {
                onDirection: (dir) => this.handleDirection(dir),
                onPause: () => this.togglePause(),
                onMute: () => this.toggleMute(),
                onSettings: () => this.openSettings(),
            },
            (cb, delay) => this.scheduleOnce(cb, delay),
        );
        this.hud.setMuted(this.muted);

        this.refreshFog();
        this.refreshGuide();
        this.refreshHud();
        this.hud.toast(locale.t('game.fragmentHint', { n: this.level.fragments }), 3.2);
        this.music.start();
    }

    private placeFragments(occupied: Set<string>): void {
        const start = this.model.data.start;
        const count = this.level.fragments;
        const cols = this.model.data.cols;
        const rows = this.model.data.rows;
        // Easy 4, normal 6, hard 8 cells. Fragments should not all sit in one corner.
        const minSep = Math.max(4, Math.floor((cols + rows) / 5));
        const picks: GridPos[] = [];
        const pool: GridPos[] = [];
        const poolKeys = new Set<string>();

        const addPool = (p: GridPos): void => {
            if (samePos(p, start)) return;
            const key = posKey(p);
            if (poolKeys.has(key)) return;
            poolKeys.add(key);
            pool.push(p);
        };

        const dead = this.model.deadEnds().filter((p) => !samePos(p, start));
        this.rng.shuffle(dead);
        dead.forEach(addPool);

        // Add candidate cells beyond dead ends so 0% braid / small mazes still work.
        let guard = 0;
        while (pool.length < Math.max(count * 6, 24) && guard++ < 4000) {
            const p = this.model.randomCell(
                this.rng,
                (q) => !samePos(q, start) && this.model.distance(start, q) >= Math.max(3, minSep - 2),
            );
            if (!p) break;
            addPool(p);
        }

        const sectorOf = (p: GridPos): number =>
            (p.x < cols * 0.5 ? 0 : 1) + (p.y < rows * 0.5 ? 0 : 2);
        const usedSectors = new Set<number>();

        while (picks.length < count) {
            let chosen: GridPos | null = null;
            for (const relax of [1, 0.8, 0.6, 0]) {
                chosen = this.pickSpreadFragment(pool, picks, usedSectors, sectorOf, minSep, relax);
                if (chosen) break;
            }
            if (!chosen) break;
            picks.push(chosen);
            usedSectors.add(sectorOf(chosen));
        }

        // Last resort: random cells with as much separation as the maze allows.
        while (picks.length < count) {
            let p = this.model.randomCell(
                this.rng,
                (q) =>
                    !samePos(q, start) &&
                    !occupied.has(posKey(q)) &&
                    picks.every((r) => this.model.distance(q, r) >= Math.max(3, Math.floor(minSep * 0.6))),
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

    private pickSpreadFragment(
        pool: GridPos[],
        picks: GridPos[],
        usedSectors: Set<number>,
        sectorOf: (p: GridPos) => number,
        minSep: number,
        relax: number,
    ): GridPos | null {
        const start = this.model.data.start;
        let best: GridPos | null = null;
        let bestScore = Number.NEGATIVE_INFINITY;

        for (const p of pool) {
            if (picks.some((q) => samePos(p, q))) continue;
            const ds = this.model.distance(start, p);
            if (ds < Math.max(2, minSep - 2)) continue;

            let dMin = Number.POSITIVE_INFINITY;
            for (const q of picks) dMin = Math.min(dMin, this.model.distance(p, q));
            if (picks.length > 0 && dMin < minSep * relax) continue;
            if (picks.length > 0 && relax === 0 && dMin < 2) continue;

            const newSector = !usedSectors.has(sectorOf(p));
            const distanceScore = picks.length === 0 ? ds : dMin;
            const score = (newSector ? 1000 : 0) + distanceScore + ds * 0.05;
            if (score > bestScore) {
                bestScore = score;
                best = p;
            }
        }
        return best;
    }

    private createFogAndGuide(): void {
        const trailGfx = this.renderer.addOverlayGraphics('YarnTrail');
        const fogGfx = this.renderer.addOverlayGraphics('Fog');
        const guideGfx = this.renderer.addOverlayGraphics('Guide');
        this.fog = new FogView(fogGfx, this.model, this.renderer.cell, this.renderer.boardW, this.renderer.boardH);
        this.guide = new GuideView(trailGfx, guideGfx, this.model);
        this.fog.loadEffect();
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
        this.sfx?.pickup();
        this.vibration.pickup();
        this.music.setUnlocked(this.collected);
        this.hud.toast(locale.t('game.fragmentProgress', { n: this.collected, total: this.level.fragments }), 2.2);
        this.refreshHud();

        if (this.collected >= this.level.fragments) this.startFinale();
    }

    private startFinale(): void {
        if (this.finale || this.state !== 'playing') return;
        this.finale = true;
        this.timerStopped = true;
        this.state = 'finale';

        const shardPositions = this.fragments
            .filter((f) => f.collected)
            .map((f) => {
                const p = f.node.worldPosition;
                return new Vec3(p.x - this.screenW * 0.5, p.y - this.screenH * 0.5, 0);
            });

        this.finaleView = new FinaleView(
            this.node,
            this.screenW,
            this.screenH,
            this.art?.cd ?? null,
            () => {
                if (this.state !== 'finale') return;
                // Keep this second completely silent: no SFX over the music gap.
                this.music.silence(1.0);
            },
            () => {
                if (this.state !== 'finale') return;
                this.music.climax();
                this.clearTemporaryEffects();
                this.spawnExit();
                this.refreshHud();
            },
            () => {
                if (this.state !== 'finale') return;
                this.finaleView = null;
                this.state = 'playing';
                this.finale = false;
                this.hud.toast(locale.t('game.finaleDone'), 3.0);
                this.refreshHud();
            },
        );
        this.finaleView.play(shardPositions, this.level.fragments);
    }

    private spawnExit(): void {
        const dist = this.model.bfs(this.player.position);
        const candidates: GridPos[] = [];

        const collect = (min: number, max: number): void => {
            for (const cell of this.model.data.cells) {
                const d = dist.get(cell.y * this.model.data.cols + cell.x);
                if (d === undefined || d < min || d > max) continue;
                const p = { x: cell.x, y: cell.y };
                if (!this.isBlockedForExit(p)) candidates.push(p);
            }
        };

        collect(this.level.exitMin, this.level.exitMax);
        if (candidates.length === 0) {
            collect(this.level.exitMax + 1, this.level.exitMax + 4);
        }
        if (candidates.length === 0) {
            collect(1, Number.MAX_SAFE_INTEGER);
        }

        const pos = candidates.length > 0 ? this.rng.pick(candidates) : null;
        if (!pos) {
            this.hud.toast(locale.t('game.exitNoPos'), 3);
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
            this.hud.toast(locale.t('game.sewerBlocked'), 2);
            return;
        }

        this.player.teleport(target);
        this.visitedTrail = [];
        this.refreshFog();
        this.refreshGuide();
        this.refreshHud();
        this.hud.toast(locale.t('game.sewerTeleport'), 2.2);
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
            showTutorial: (type, text) => {
                if (self.seenItems.has(type)) {
                    self.hud.toast(text, 2.2);
                    return;
                }
                self.seenItems.add(type);
                self.hud.showTutorial(type, text);
            },
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
        this.fog.setTarget(this.player.position, this.firefly > 0 ? 4 : 2);
    }

    private refreshGuide(): void {
        this.guide.render({
            player: this.player.position,
            exit: this.exitPos,
            fragments: this.fragments,
            yarnActive: this.yarn > 0,
            butterflyActive: this.butterflySteps > 0,
            visitedTrail: this.visitedTrail,
            cellToLocal: (p) => this.renderer.cellToLocal(p),
            boardH: this.renderer.boardH,
            cell: this.renderer.cell,
        });
    }

    private refreshHud(): void {
        if (!this.hud) return;

        const effects: string[] = [];
        if (this.firefly > 0) effects.push(locale.t('hud.firefly', { n: this.firefly.toFixed(0) }));
        if (this.wine > 0) effects.push(locale.t('hud.wine', { n: this.wine.toFixed(0) }));
        if (this.catStrip > 0) effects.push(locale.t('hud.catStrip', { n: this.catStrip.toFixed(0) }));
        if (this.yarn > 0) effects.push(locale.t('hud.yarn', { n: this.yarn.toFixed(0) }));
        if (this.butterflySteps > 0) effects.push(locale.t('hud.butterfly', { n: this.butterflySteps }));

        this.hud.setStats({
            collected: this.collected,
            total: this.level.fragments,
            exitOpen: !!this.exitPos,
            timeLeft: this.timeLeft,
            elapsed: this.elapsed,
            steps: this.player.steps,
            effects: effects.length > 0 ? effects.join('　') : locale.t('hud.none'),
            timerStopped: this.timerStopped,
            seed: this.seed,
            cols: this.level.cols,
            rows: this.level.rows,
            levelLabel: locale.difficultyName(this.level.id),
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
        this.ending = true;
        this.timerStopped = true;
        this.music.stop();
        this.tone.timeout();
        this.sfx?.timeout();
        this.vibration.timeout();
        this.refreshHud();
        this.hud.toast(locale.t('game.ownerDoor'), 1.2);

        // Placeholder timeout beat: the cat is lifted up, then the result card appears.
        tween(this.player.node)
            .by(1.4, { position: new Vec3(0, 160, 0) }, { easing: 'sineIn' })
            .start();

        this.scheduleOnce(() => {
            if (this.state !== 'timeout') return;
            this.ending = false;
            this.hud.showOverlay(
                locale.t('game.timeoutTitle'),
                locale.t('game.timeoutBody', {
                    n: this.collected,
                    total: this.level.fragments,
                    time: this.timeText(this.elapsed),
                }),
                locale.t('game.timeoutHint'),
                this.art?.owner ?? null,
            );
        }, 1.5);
    }

    private win(): void {
        if (this.state === 'won' || this.state === 'timeout') return;
        this.state = 'won';
        this.finale = false;
        this.music.stop();
        this.tone.climax();
        this.sfx?.win();

        const ratio = this.timeLeft / this.level.timeLimit;
        const stars = ratio >= 0.4 ? 3 : ratio >= 0.15 ? 2 : 1;
        const starText = '★'.repeat(stars) + '☆'.repeat(3 - stars);
        const newBest = this.progress.submitWin(this.level.id, stars, this.elapsed);

        this.hud.showOverlay(
            locale.t('game.winTitle', { stars: starText }),
            locale.t('game.winBody', {
                n: this.collected,
                total: this.level.fragments,
                steps: this.player.steps,
                time: this.timeText(this.elapsed),
                best: newBest ? locale.t('game.newRecord') : '',
            }),
            locale.t('game.winHint'),
            this.art?.cd ?? null,
        );
    }

    private toggleMute(): boolean {
        this.muted = !this.muted;
        this.progress.setMuted(this.muted);
        this.music.setMuted(this.muted);
        this.tone.setMuted(this.muted);
        this.sfx?.setMuted(this.muted);
        this.hud?.setMuted(this.muted);
        this.settings?.setMuted(this.muted);
        if (this.hud && this.state === 'playing') {
            this.hud.toast(this.muted ? locale.t('game.muted') : locale.t('game.unmuted'), 1.4);
        }
        return this.muted;
    }

    private setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(1, volume));
        this.progress.setVolume(this.volume);
        this.music.setVolume(this.volume);
        this.tone.setVolume(this.volume);
        this.sfx?.setVolume(this.volume);
    }

    private openSettings(): void {
        if (this.settings) return;
        if (this.state === 'finale' || this.ending) return;
        // Finale is a short cinematic; settings/pause are intentionally ignored.
        this.settingsWasPlaying = this.state === 'playing';
        if (this.settingsWasPlaying) {
            this.state = 'paused';
            this.music.pause();
        }
        this.settings = new SettingsView(
            this.node,
            this.screenW,
            this.screenH,
            this.volume,
            this.muted,
            this.progress.vibration,
            (v) => this.setVolume(v),
            () => this.toggleMute(),
            () => this.toggleLanguage(),
            () => this.toggleVibration(),
            () => this.progress.resetRecords(),
            () => this.closeSettings(),
        );
    }

    private closeSettings(): void {
        if (!this.settings) return;
        const fromMenu = this.state === 'menu';
        this.settings.dispose();
        this.settings = null;
        if (this.settingsWasPlaying && this.state === 'paused') {
            this.state = 'playing';
            this.music.resume();
        } else if (fromMenu && this.menu) {
            // Rebuild so best records / mute labels reflect changes made here.
            this.menu.dispose();
            this.menu = null;
            this.openMenu();
        }
        this.settingsWasPlaying = false;
    }

    private toggleLanguage(): void {
        const next: Language = locale.language === 'zh' ? 'en' : 'zh';
        locale.setLanguage(next);
        this.language = next;
        this.progress.setLanguage(next);

        if (this.settings) {
            this.settings.dispose();
            this.settings = null;
        }
        if (this.menu) {
            this.menu.dispose();
            this.menu = null;
        }
        this.settingsWasPlaying = false;
        this.state = 'menu';
        this.ending = false;
        this.openMenu();
    }

    private toggleVibration(): boolean {
        const enabled = !this.progress.vibration;
        this.progress.setVibration(enabled);
        this.vibration.setEnabled(enabled);
        return enabled;
    }

    private togglePause(): void {
        if (this.settings || this.ending || this.state === 'finale') return;
        if (this.state === 'playing' && !this.finale) {
            this.state = 'paused';
            this.music.pause();
            this.hud.showOverlay(
                locale.t('game.pauseTitle'),
                locale.t('game.pauseBody'),
                locale.t('game.pauseHint'),
            );
        } else if (this.state === 'paused') {
            this.state = 'playing';
            this.music.resume();
            this.hud.hideOverlay();
        }
    }

    private restart(): void {
        if (this.settings || this.state === 'menu' || this.state === 'finale') return;
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
        this.music.setUnlocked(this.collected);
        this.refreshHud();
        if (this.collected >= this.level.fragments) this.startFinale();
    }

    private debugSubtractTime(): void {
        if (this.state !== 'playing') return;
        this.timeLeft = Math.max(0, this.timeLeft - 30);
        if (this.timeLeft <= 0) this.timeout();
        else this.hud.toast(locale.t('game.debugTime'), 1.5);
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
        if (this.settings || this.ending || this.state === 'menu') return;
        if (this.state === 'won' || this.state === 'timeout') {
            this.restart();
            return;
        }
        if (this.state === 'paused') {
            this.togglePause();
            return;
        }
        if (this.state !== 'playing' || this.finale) return;
        void this.tryMove(dir);
    }

    private handleTap(): void {
        if (this.settings || this.ending || this.state === 'menu') return;
        if (this.state === 'won' || this.state === 'timeout') {
            this.restart();
            return;
        }
        if (this.state === 'paused') {
            this.togglePause();
        }
    }
}
