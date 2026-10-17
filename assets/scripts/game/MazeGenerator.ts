import { Rng } from '../core/Rng';

export type Dir = 0 | 1 | 2 | 3; // N E S W

export interface GridPos {
    x: number;
    y: number;
}

export interface MazeCell {
    x: number;
    y: number;
    walls: [boolean, boolean, boolean, boolean]; // N E S W
}

export interface MazeData {
    cols: number;
    rows: number;
    cells: MazeCell[];
    start: GridPos;
    seed: number;
}

export const DIRS = [
    { dx: 0, dy: 1, wall: 0, opposite: 2 }, // N
    { dx: 1, dy: 0, wall: 1, opposite: 3 }, // E
    { dx: 0, dy: -1, wall: 2, opposite: 0 }, // S
    { dx: -1, dy: 0, wall: 3, opposite: 1 }, // W
] as const;

export function keyOf(cols: number, p: GridPos): number {
    return p.y * cols + p.x;
}

export function samePos(a: GridPos, b: GridPos): boolean {
    return a.x === b.x && a.y === b.y;
}

export function generateMaze(cols: number, rows: number, seed: number, braid = 0): MazeData {
    const rng = new Rng(seed);
    const cells: MazeCell[] = [];
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            cells.push({ x, y, walls: [true, true, true, true] });
        }
    }

    const inBounds = (x: number, y: number): boolean => x >= 0 && x < cols && y >= 0 && y < rows;
    const visited = new Uint8Array(cols * rows);
    const stack: number[] = [0];
    visited[0] = 1;

    while (stack.length > 0) {
        const cur = stack[stack.length - 1];
        const cx = cur % cols;
        const cy = Math.floor(cur / cols);
        const options: Array<{ index: number; dir: number }> = [];

        for (let d = 0; d < 4; d++) {
            const nx = cx + DIRS[d].dx;
            const ny = cy + DIRS[d].dy;
            if (!inBounds(nx, ny)) continue;
            const ni = ny * cols + nx;
            if (visited[ni] === 0) options.push({ index: ni, dir: d });
        }

        if (options.length === 0) {
            stack.pop();
            continue;
        }

        const pick = options[rng.int(options.length)];
        const nx = cx + DIRS[pick.dir].dx;
        const ny = cy + DIRS[pick.dir].dy;
        cells[cur].walls[DIRS[pick.dir].wall] = false;
        cells[pick.index].walls[DIRS[pick.dir].opposite] = false;
        visited[pick.index] = 1;
        stack.push(pick.index);
    }

    // Optional braiding: remove a few interior walls to create loops.
    const wallCount = Math.floor(braid * cols * rows);
    let removed = 0;
    let guard = 0;
    while (removed < wallCount && guard++ < wallCount * 20) {
        const x = 1 + rng.int(Math.max(1, cols - 2));
        const y = 1 + rng.int(Math.max(1, rows - 2));
        const d = rng.int(2); // only N / E, avoid duplicate pairs
        const dir = DIRS[d];
        const nx = x + dir.dx;
        const ny = y + dir.dy;
        if (!inBounds(nx, ny) || nx === 0 || ny === 0 || nx === cols - 1 || ny === rows - 1) continue;
        const a = cells[y * cols + x];
        const b = cells[ny * cols + nx];
        if (!a.walls[dir.wall]) continue;
        a.walls[dir.wall] = false;
        b.walls[dir.opposite] = false;
        removed++;
    }

    return { cols, rows, cells, start: { x: 0, y: 0 }, seed };
}

export function bfs(maze: MazeData, from: GridPos): Map<number, number> {
    const dist = new Map<number, number>();
    const queue: number[] = [];
    const startKey = keyOf(maze.cols, from);
    dist.set(startKey, 0);
    queue.push(startKey);

    for (let head = 0; head < queue.length; head++) {
        const curKey = queue[head];
        const cx = curKey % maze.cols;
        const cy = Math.floor(curKey / maze.cols);
        const cell = maze.cells[curKey];
        const cd = dist.get(curKey)!;

        for (let d = 0; d < 4; d++) {
            if (cell.walls[d]) continue;
            const nx = cx + DIRS[d].dx;
            const ny = cy + DIRS[d].dy;
            if (nx < 0 || nx >= maze.cols || ny < 0 || ny >= maze.rows) continue;
            const nk = ny * maze.cols + nx;
            if (dist.has(nk)) continue;
            dist.set(nk, cd + 1);
            queue.push(nk);
        }
    }

    return dist;
}

export function pathTo(maze: MazeData, from: GridPos, to: GridPos): GridPos[] {
    const startKey = keyOf(maze.cols, from);
    const goalKey = keyOf(maze.cols, to);
    if (startKey === goalKey) return [from];

    const parent = new Map<number, number>();
    const queue: number[] = [startKey];
    parent.set(startKey, -1);

    for (let head = 0; head < queue.length; head++) {
        const curKey = queue[head];
        const cx = curKey % maze.cols;
        const cy = Math.floor(curKey / maze.cols);
        const cell = maze.cells[curKey];

        for (let d = 0; d < 4; d++) {
            if (cell.walls[d]) continue;
            const nx = cx + DIRS[d].dx;
            const ny = cy + DIRS[d].dy;
            if (nx < 0 || nx >= maze.cols || ny < 0 || ny >= maze.rows) continue;
            const nk = ny * maze.cols + nx;
            if (parent.has(nk)) continue;
            parent.set(nk, curKey);
            if (nk === goalKey) {
                const path: GridPos[] = [];
                let k = nk;
                while (k !== -1) {
                    path.push({ x: k % maze.cols, y: Math.floor(k / maze.cols) });
                    k = parent.get(k)!;
                }
                path.reverse();
                return path;
            }
            queue.push(nk);
        }
    }

    return [];
}

export function deadEnds(maze: MazeData): GridPos[] {
    return maze.cells
        .filter((c) => c.walls.filter((w) => w).length === 3)
        .map((c) => ({ x: c.x, y: c.y }));
}

export function canMove(maze: MazeData, p: GridPos, dir: Dir): boolean {
    const cell = maze.cells[keyOf(maze.cols, p)];
    return !cell.walls[dir];
}

export function step(maze: MazeData, p: GridPos, dir: Dir): GridPos | null {
    if (!canMove(maze, p, dir)) return null;
    const nx = p.x + DIRS[dir].dx;
    const ny = p.y + DIRS[dir].dy;
    if (nx < 0 || nx >= maze.cols || ny < 0 || ny >= maze.rows) return null;
    return { x: nx, y: ny };
}
