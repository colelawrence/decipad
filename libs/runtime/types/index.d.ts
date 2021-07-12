declare namespace Sync {
  import { List, Doc, Change } from 'automerge';
  import { Node as SlateNode } from 'slate';
  type Node = SlateNode & { id: string; type: string };
  export { Node, List, Doc, Change };
}

type Id = string;

interface Session {
  user: User;
}

type SyncPadValue = Sync.List<Sync.Node>;

type SyncPadDoc = Sync.Doc<SyncPadValue>;

type AnySyncValue = SyncPadValue | Pad | Workspace | List<Id>;

/* Slate */

declare namespace ExtendedSlate {
  import {
    InsertNodeOperation as InsertNodeOperation,
    InsertTextOperation as InsertTextOperation,
    MergeNodeOperation as MergeNodeOperation,
    MoveNodeOperation as MoveNodeOperation,
    RemoveNodeOperation as RemoveNodeOperation,
    RemoveTextOperation as RemoveTextOperation,
    SetNodeOperation as SetNodeOperation,
    SplitNodeOperation as SplitNodeOperation,
  } from 'slate';

  type IdentifiableOperation = {
    isRemote: boolean;
    id: string;
  };

  export type ExtendedSlateInsertNodeOperation = InsertNodeOperation &
    IdentifiableOperation;
  export type ExtendedSlateInsertTextOperation = InsertTextOperation &
    IdentifiableOperation;
  export type ExtendedSlateMergeNodeOperation = MergeNodeOperation &
    IdentifiableOperation;
  export type ExtendedSlateMoveNodeOperation = MoveNodeOperation &
    IdentifiableOperation;
  export type ExtendedSlateRemoveNodeOperation = RemoveNodeOperation &
    IdentifiableOperation;
  export type ExtendedSlateRemoveTextOperation = RemoveTextOperation &
    IdentifiableOperation;
  export type ExtendedSlateSetNodeOperation = SetNodeOperation &
    IdentifiableOperation;
  export type ExtendedSlateSplitNodeOperation = SplitNodeOperation &
    IdentifiableOperation;

  export type ExtendedSlateOperation =
    | ExtendedSlateInsertNodeOperation
    | ExtendedSlateSlateMergeNodeOperation
    | ExtendedSlateMoveNodeOperation
    | ExtendedSlateRemoveNodeOperation
    | ExtendedSlateRemoveTextOperation
    | ExtendedSlateSetNodeOperation
    | ExtendedSlateSplitNodeOperation;
}
