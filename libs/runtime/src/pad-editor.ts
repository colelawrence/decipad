import { Observable, Subject, Subscription } from 'rxjs';
import debounce from 'lodash.debounce';
import { Operation as SlateOperation } from 'slate';
import { nanoid } from 'nanoid';
import { Runtime } from './runtime';
import { createReplica, Replica } from './replica';
import { fromSlateOpType, SupportedSlateOpTypes } from './from-slate-op';
import { toSlateOps } from './to-slate-ops';
import { toJS } from './utils/to-js';
import { toSync } from './utils/to-sync';
import { Computer } from './computer';
import { fnQueue } from './utils/fn-queue';
import { observeSubscriberCount } from './utils/observe-subscriber-count';
import { uri } from './utils/uri';

const DEBOUNCE_PROCESS_SLATE_OPS =
  Number(process.env.DECI_DEBOUNCE_PROCESS_SLATE_OPS) || 500;

const initialValue = toSync([
  {
    children: [
      {
        type: 'p',
        children: [
          {
            text: '',
          },
        ],
        id: '000000000000000000000',
      },
    ],
  },
]) as SyncPadDoc;

// we have to initialize a static value because randomization of ids by automerge will lead to initial divergence and we don't want that.
const initialStaticValue =
  '["~#iL",[["~#iM",["ops",["^0",[["^1",["action","makeList","obj","b74ed06c-98ea-4f1b-8afd-ebf2b472b1b3"]],["^1",["action","ins","obj","b74ed06c-98ea-4f1b-8afd-ebf2b472b1b3","key","_head","elem",1]],["^1",["action","makeMap","obj","93fd8288-5669-4590-a972-582ccf9a9adb"]],["^1",["action","makeList","obj","5129085f-3721-4e1f-8f5a-fd47ad8e0d0e"]],["^1",["action","ins","obj","5129085f-3721-4e1f-8f5a-fd47ad8e0d0e","key","_head","elem",1]],["^1",["action","makeMap","obj","60fc8179-0b26-4e72-b35a-5d32a8442b14"]],["^1",["action","set","obj","60fc8179-0b26-4e72-b35a-5d32a8442b14","key","type","value","p"]],["^1",["action","makeList","obj","100125ae-8249-427b-b3b9-bd4c1c41e5b9"]],["^1",["action","ins","obj","100125ae-8249-427b-b3b9-bd4c1c41e5b9","key","_head","elem",1]],["^1",["action","makeMap","obj","ad70cfa3-e5e9-4ce8-a5fa-ef794c3402b7"]],["^1",["action","makeText","obj","8d5a0988-079f-47bc-ba8b-d2a93518850f"]],["^1",["action","link","obj","ad70cfa3-e5e9-4ce8-a5fa-ef794c3402b7","key","text","value","8d5a0988-079f-47bc-ba8b-d2a93518850f"]],["^1",["action","link","obj","100125ae-8249-427b-b3b9-bd4c1c41e5b9","key","starter:1","value","ad70cfa3-e5e9-4ce8-a5fa-ef794c3402b7"]],["^1",["action","link","obj","60fc8179-0b26-4e72-b35a-5d32a8442b14","key","children","value","100125ae-8249-427b-b3b9-bd4c1c41e5b9"]],["^1",["action","set","obj","60fc8179-0b26-4e72-b35a-5d32a8442b14","key","id","value","000000000000000000000"]],["^1",["action","link","obj","5129085f-3721-4e1f-8f5a-fd47ad8e0d0e","key","starter:1","value","60fc8179-0b26-4e72-b35a-5d32a8442b14"]],["^1",["action","link","obj","93fd8288-5669-4590-a972-582ccf9a9adb","key","children","value","5129085f-3721-4e1f-8f5a-fd47ad8e0d0e"]],["^1",["action","link","obj","b74ed06c-98ea-4f1b-8afd-ebf2b472b1b3","key","starter:1","value","93fd8288-5669-4590-a972-582ccf9a9adb"]],["^1",["action","link","obj","00000000-0000-0000-0000-000000000000","key","value","value","b74ed06c-98ea-4f1b-8afd-ebf2b472b1b3"]]]],"actor","starter","seq",1,"deps",["^1",[]],"message","Initialization","undoable",false]]]]';

class PadEditor {
  private slateOpQueue: ExtendedSlate.ExtendedSlateOperation[] = [];
  private replica: Replica<SyncPadDoc>;
  private slateOpsObservable = new Subject<
    ExtendedSlate.ExtendedSlateOperation[]
  >();
  public slateOpsCountObservable = observeSubscriberCount(
    this.slateOpsObservable
  );
  private debouncedProcessSlateOps: () => void;
  private computer: Computer;
  private changesSubscription: Subscription;
  private pendingApplySlateOpIds: string[] = [];
  private pendingApplyResolve: ((value: unknown) => void) | null = null;
  private pendingApplyPromise: Promise<unknown> | null = null;
  private queue = fnQueue();

  constructor(public padId: Id, runtime: Runtime, startReplicaSync = true) {
    this.processSlateOps = this.processSlateOps.bind(this);
    this.debouncedProcessSlateOps = debounce(
      this.processSlateOps,
      DEBOUNCE_PROCESS_SLATE_OPS
    );

    this.replica = createReplica<SyncPadDoc>({
      name: uri('pads', padId, 'content'),
      runtime,
      initialValue,
      initialStaticValue,
      createIfAbsent: true,
      startReplicaSync,
    });
    this.computer = new Computer(this.replica);
    this.replica.beforeRemoteChanges = () => {
      this.processSlateOps();
      return this.pendingApplyPromise;
    };
    this.changesSubscription = this.replica.remoteChanges.subscribe(
      ({ diffs, doc, before }) => {
        const ops = toSlateOps(diffs, doc, before).map(remoteOp);
        this.queue.push(() => this.applySlateOps(ops));
      }
    );
  }

  getValue(): SyncPadValue {
    return toJS(this.replica.getValue());
  }

  slateOps(): Observable<ExtendedSlate.ExtendedSlateOperation[]> {
    return this.slateOpsObservable;
  }

  applySlateOps(ops: ExtendedSlate.ExtendedSlateOperation[]) {
    const p = (this.pendingApplyPromise = new Promise((resolve) => {
      this.pendingApplyResolve = resolve;
      if (ops.length > 0) {
        for (const op of ops) {
          this.pendingApplySlateOpIds.push(op.id as string);
        }
        this.slateOpsObservable.next(ops);
      } else {
        resolve(null);
      }
    }));
    return p;
  }

  sendSlateOperations(ops: ExtendedSlate.ExtendedSlateOperation[]) {
    for (const op of ops) {
      if (op.id) {
        const index = this.pendingApplySlateOpIds.indexOf(op.id as string);
        if (index >= 0) {
          this.pendingApplySlateOpIds.splice(index, 1);
          if (this.pendingApplySlateOpIds.length === 0) {
            this.pendingApplyResolve!.call(null, undefined);
          }
        }
      }
    }
    const operations = ops.filter(isNotRemoteOp);
    if (operations.length > 0) {
      this.slateOpQueue = this.slateOpQueue.concat(operations);
      this.debouncedProcessSlateOps();
    }
  }

  stop() {
    this.flush();
    this.slateOpsObservable.complete();
    this.changesSubscription.unsubscribe();
    this.replica.stop();
  }

  processSlateOps() {
    const ops = this.slateOpQueue;
    if (ops.length === 0) {
      return;
    }
    this.slateOpQueue = [];
    let applied = false;
    this.replica.mutate((doc) => {
      for (const op of ops) {
        if (op.isRemote === true) {
          continue;
        }
        // console.log('before:', this.replica.getValue())
        // console.trace('OP:', op);
        const applyOp = fromSlateOpType(
          (op as unknown as ExtendedSlate.ExtendedSlateOperation)
            .type as SupportedSlateOpTypes
        );

        if (applyOp) {
          applyOp(doc as SyncPadValue, op);
          applied = true;
        }
      }
    });
    if (applied) {
      this.replica.flush();
      this.computer.reset();
    }
  }

  flush() {
    this.processSlateOps();
  }

  resultAt(blockId: string, line: number): Promise<ComputationResult> {
    this.flush();
    return this.computer.resultAt(blockId, line);
  }
}

function remoteOp(op: SlateOperation): ExtendedSlate.ExtendedSlateOperation {
  return { ...op, isRemote: true, id: nanoid() };
}

function isNotRemoteOp(op: ExtendedSlate.ExtendedSlateOperation): boolean {
  return !op.isRemote;
}

export { PadEditor };
