import { MyNode } from '@decipad/editor-types';
import { useParentNodeEntry } from './useParentNodeEntry';

export const useParentNode = <TNode extends MyNode = MyNode>(
  node: MyNode
): TNode | undefined => useParentNodeEntry<TNode>(node)?.[0];
