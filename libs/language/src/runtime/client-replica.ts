import automerge, { Change } from "automerge";
import debounce from "lodash.debounce";
import { Operation as SlateOperation, ExtendedSlateOperation } from "./slate";
import { SyncDoc } from "./model";
import { Observers } from "./utils/observers";
import { fromSlateOpType, SupportedSlateOpTypes } from "./from-slate-op";
import { toSync } from "./utils/to-sync";
import { toJS } from "./utils/to-js";
import { toSlateOps } from "./to-slate-ops";

const defaultInitialValue = {
  children: [
    {
      children: [
        {
          children: [
            {
              type: "paragraph",
              text: "",
            },
          ],
        },
      ],
    },
  ],
};

export class ClientReplica {
  context: SyncDoc;
  actorId: string;
  observers = new Observers();
  slateOpQueue: SlateOperation[] = [];
  processSlateOps: () => void;

  constructor(actorId: string) {
    this.actorId = actorId;
    this.debouncedProcessSlateOps = this.debouncedProcessSlateOps.bind(this);
    this.processSlateOps = debounce(this.debouncedProcessSlateOps, 500).bind(
      this
    );
  }

  start(initialValue: string | null) {
    if (this.context !== undefined) {
      throw new Error("replica already started");
    }
    if (initialValue !== null) {
      this.context = automerge.load(initialValue, this.actorId);
    } else {
      this.context = automerge.from(toSync(defaultInitialValue), this.actorId);
    }
    this.observers.notify("initialContext", toJS(this.context));
  }

  applySlateOperations(ops: SlateOperation[]) {
    this.slateOpQueue = this.slateOpQueue.concat(ops);
    this.processSlateOps();
  }

  flushOps() {
    this.debouncedProcessSlateOps();
  }

  debouncedProcessSlateOps() {
    const ops = this.slateOpQueue;
    this.slateOpQueue = [];
    const before = this.context;
    for (const op of ops) {
      if (op.isRemote === true) {
        continue;
      }
      const applyOp = fromSlateOpType(
        ((op as unknown) as ExtendedSlateOperation)
          .type as SupportedSlateOpTypes
      );

      if (applyOp === undefined) {
        continue;
      }

      this.context = automerge.change(this.context, (context) => {
        applyOp(context.children, op);
      });
    }

    const changes = automerge.getChanges(before, this.context);
    if (changes.length > 0) {
      this.observers.notify("changes", changes);
    }
    this.observers.notify("newContext", toJS(this.context));
  }

  applyRemoteChanges(changes: Change[]) {
    const before = this.context;
    this.context = automerge.applyChanges(this.context, changes);
    const ops = automerge.diff(before, this.context);
    const slateOps = toSlateOps(ops, this.context, before);
    for (const op of slateOps) {
      op.isRemote = true;
    }
    this.observers.notify("slateOps", slateOps);
  }

  subscribe(observer: any) {
    return this.observers.subscribe(observer);
  }

  save() {
    return automerge.save(this.context);
  }
}
