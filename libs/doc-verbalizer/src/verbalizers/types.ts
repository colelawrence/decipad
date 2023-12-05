import type { AnyElement, MyNode } from '../../../editor-types/src';

export type LeafVerbalizer = (element: MyNode) => string;

export type Verbalizer = (
  element: AnyElement,
  verbalize: LeafVerbalizer
) => string;

type VarnameAndId = [string, string];
export type VarnameToId = (element: AnyElement) => VarnameAndId;
