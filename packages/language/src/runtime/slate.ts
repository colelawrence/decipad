import { Operation, Path, NodeEntry } from "slate";

export type SyncNode = NodeEntry;

interface ExtendedSlateOperation {
  type: string;
  isRemote: boolean;
}

export { ExtendedSlateOperation, Path, Operation };
