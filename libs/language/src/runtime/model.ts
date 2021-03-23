import Automerge from 'automerge';
import { Node } from 'slate';

export { Node };

export type SyncValue = Automerge.List<Node>;

export type SyncDoc = Automerge.Doc<{ children: SyncValue }>;
