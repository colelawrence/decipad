declare namespace Sync {
  import { List, Doc } from 'automerge';
  import { Node } from 'slate';
  export { Node, List, Doc };
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

type Tags = string[]

interface Identifiable {
  id: Id
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

interface Workspace {
  id: Id;
  name: string;
  permissions: Permission[];
}

interface Permission {
  id: Id;
  role: RoleId;
  isOwner: boolean;
  canRead: boolean;
  canWrite: boolean;
}

interface Pad {
  id: Id;
  name: string;
  workspaceId: string;
  lastUpdatedAt: Date;
  tags: Tags
  permissions: Permission[]
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

type RoleId = string;

type SyncPadValue = Sync.List<Sync.Node>;

type SyncPadDoc = Sync.Doc<SyncPadValue>;

interface ExtendedSlateOperation {
  type: string;
  isRemote: boolean;
}

interface AsyncSubject<T> {
  error: Error | null;
  loading: boolean;
  data: T | null;
}

interface Mutation<T> {
  before: T | null,
  after: T | null
}
