import { Node } from 'cc';
import { GridPos } from './MazeGenerator';

export type ItemType =
    | 'butterfly'
    | 'firefly'
    | 'wine'
    | 'catStrip'
    | 'sewer'
    | 'fish'
    | 'yarn'
    | 'feather';

export type DemoState = 'playing' | 'paused' | 'finale' | 'won' | 'timeout';

export interface FragmentView {
    pos: GridPos;
    node: Node;
    collected: boolean;
}

export interface ItemView {
    type: ItemType;
    pos: GridPos;
    node: Node;
    used: boolean;
}
