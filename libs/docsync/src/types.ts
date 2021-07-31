import {
  List as SyncList,
  Doc as SyncDoc,
  Change as SyncChange,
  Diff as SyncDiff,
  CollectionType as SyncCollectionType,
} from 'automerge';
import { Node as SlateNode } from 'slate';

export type { SyncList, SyncDoc, SyncChange, SyncDiff, SyncCollectionType };
export type SyncNode = SlateNode & { id: string; type: string };
export type SyncValue = SyncList<SyncNode>;
export type SyncDocValue = SyncDoc<SyncValue>;

/* Slate */

interface IdentifiableOperation {
  isRemote?: boolean;
  id?: string;
}

export type ExtendedSlateInsertNodeOperation =
  import('slate').InsertNodeOperation & IdentifiableOperation;
export type ExtendedSlateInsertTextOperation =
  import('slate').InsertTextOperation & IdentifiableOperation;
export type ExtendedSlateMergeNodeOperation =
  import('slate').MergeNodeOperation & IdentifiableOperation;
export type ExtendedSlateMoveNodeOperation = import('slate').MoveNodeOperation &
  IdentifiableOperation;
export type ExtendedSlateRemoveNodeOperation =
  import('slate').RemoveNodeOperation & IdentifiableOperation;
export type ExtendedSlateRemoveTextOperation =
  import('slate').RemoveTextOperation & IdentifiableOperation;
export type ExtendedSlateSetNodeOperation /* prettier gib line pls kthx */ =
  import('slate').SetNodeOperation & IdentifiableOperation;
export type ExtendedSlateSplitNodeOperation =
  import('slate').SplitNodeOperation & IdentifiableOperation;

export type ExtendedSlateOperation =
  | ExtendedSlateInsertNodeOperation
  | ExtendedSlateInsertTextOperation
  | ExtendedSlateMergeNodeOperation
  | ExtendedSlateMoveNodeOperation
  | ExtendedSlateRemoveNodeOperation
  | ExtendedSlateRemoveTextOperation
  | ExtendedSlateSetNodeOperation
  | ExtendedSlateSplitNodeOperation;
