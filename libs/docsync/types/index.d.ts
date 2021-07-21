declare namespace Sync {
  import { List, Doc, Change } from 'automerge';
  import { Node as SlateNode } from 'slate';
  type Node = SlateNode & { id: string; type: string };
  export { Node, List, Doc, Change };
}

type SyncValue = Sync.List<Sync.Node>;

type SyncDocDoc = Sync.Doc<SyncValue>;

/* Slate */

declare namespace ExtendedSlate {
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
  export type ExtendedSlateMoveNodeOperation =
    import('slate').MoveNodeOperation & IdentifiableOperation;
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
}
