import { SyncDoc } from "../model";

function docFromContext(context: SyncDoc) {
  return context.children[0].children;
}

export { docFromContext };
