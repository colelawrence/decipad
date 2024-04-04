import { type MyElement } from '@decipad/editor-types';
import { type TNodeEntry } from '@udecode/plate-common';
import { type NodeEntry } from 'slate';
import { isElement } from './isElement';

export const isEntryOfType = <Type extends MyElement['type']>(
  entry: NodeEntry | null | undefined,
  type: Type
): entry is TNodeEntry<Extract<MyElement, { type: Type }>> =>
  isElement(entry?.[0]) && entry?.[0].type === type;
