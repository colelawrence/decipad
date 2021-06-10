declare namespace Sync {
  import { List, Doc, Change } from 'automerge';
  import { Node as SlateNode } from 'slate';
  type Node = SlateNode & { id: string; type: string };
  export { Node, List, Doc, Change };
}

declare namespace AST {
  import { Block } from '@decipad/language';
  export { Block };
}

declare namespace Parser {
  import { ParsedBlock } from '@decipad/language';
  export { ParsedBlock };
}

type Id = string;

type Tags = string[];

interface Identifiable {
  id: Id;
}

interface Session {
  user: User;
}

interface User {
  id: Id;
  name: string;
  email: string;
  avatar: string;
}

interface ComputationResult {
  type: Type | TableType | undefined;
  value: Interpreter.Result | undefined;
  errors: ComputationError[];
}

interface ComputationError {
  message: string;
  details: string;
  fileName: string;
  lineNumber: number;
  columnNumber: number;
}

interface ComputerUnparsedBlock {
  id: string;
  source: string;
}

interface ComputerCodeBlock {
  id: string;
  ast: AST.Node;
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

/* Collab */

interface AsyncSubject<T> {
  error: Error | null;
  loading: boolean;
  data: T | null;
}

interface Mutation<T> {
  before: T | null;
  after: T | null;
}

interface TopicSubscriptionOperation {
  op: 'add' | 'remove';
  topic: string;
}

interface DocMetadata {
  createdLocally: boolean;
}

interface RemoteWebSocketOp {
  o: 's' | 'u' | 'c';
  t: string;
  c: Sync.Change[] | null;
  type?: string;
}

interface RemoteOp {
  op: 'subscribed' | 'unsubscribed' | 'changed';
  topic: string;
  changes: Sync.Change[] | null;
}
