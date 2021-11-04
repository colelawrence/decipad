import { Array as YArray, Text as YText, Map as YMap } from 'yjs';

export type Doc = YArray<RootElement>;

export type RootElement = YMap<YArray<LeafElement> | string>;

export type LeafElement = YMap<YText>;
