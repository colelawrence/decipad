import { Observable, Subject, Subscription } from 'rxjs';
import debounce from 'lodash.debounce';
import { Operation as SlateOperation } from 'slate';
import { nanoid } from 'nanoid';
import assert from 'assert';
import { Runtime } from './runtime';
import { createReplica, Replica, ChangeEvent } from '@decipad/replica';
import { fromSlateOpType, SupportedSlateOpTypes } from './from-slate-op';
import { toSlateOps } from './to-slate-ops';
import { toJS } from './utils/to-js';
import { toSync } from './utils/to-sync';
import { fnQueue } from './utils/fn-queue';
import { observeSubscriberCount } from './utils/observe-subscriber-count';
import { uri } from './utils/uri';

export interface PadEditorOptions {
  startReplicaSync?: boolean;
  storage?: Storage;
}

const DEBOUNCE_PROCESS_SLATE_OPS =
  Number(process.env.DECI_DEBOUNCE_PROCESS_SLATE_OPS) || 500;
const MAX_RETRY_INTERVAL_MS =
  Number(process.env.DECI_MAX_RETRY_INTERVAL_MS) || 10000;
const SEND_CHANGES_DEBOUNCE_MS =
  Number(process.env.DECI_SEND_CHANGES_DEBOUNCE_MS) || 0;
const fetchPrefix = process.env.DECI_API_URL || '';

// we have to initialize a static value because randomization of ids by automerge will lead to initial divergence and we don't want that.
const initialStaticValue =
  '["~#iL",[["~#iM",["ops",["^0",[["^1",["action","makeList","obj","982602ad-8ccc-406a-bd96-39df0b1a71c5"]],["^1",["action","ins","obj","982602ad-8ccc-406a-bd96-39df0b1a71c5","key","_head","elem",1]],["^1",["action","makeMap","obj","73fce065-0465-4547-8270-dcd75cb37bfb"]],["^1",["action","set","obj","73fce065-0465-4547-8270-dcd75cb37bfb","key","type","value","p"]],["^1",["action","makeList","obj","0055603a-6e3f-4e1d-87cb-9c9aec848906"]],["^1",["action","ins","obj","0055603a-6e3f-4e1d-87cb-9c9aec848906","key","_head","elem",1]],["^1",["action","makeMap","obj","1758ff95-f7ca-484c-a2fa-401397b65d8d"]],["^1",["action","makeText","obj","5778df97-5560-4410-a7c3-ba364d339ac9"]],["^1",["action","link","obj","1758ff95-f7ca-484c-a2fa-401397b65d8d","key","text","value","5778df97-5560-4410-a7c3-ba364d339ac9"]],["^1",["action","link","obj","0055603a-6e3f-4e1d-87cb-9c9aec848906","key","starter:1","value","1758ff95-f7ca-484c-a2fa-401397b65d8d"]],["^1",["action","link","obj","73fce065-0465-4547-8270-dcd75cb37bfb","key","children","value","0055603a-6e3f-4e1d-87cb-9c9aec848906"]],["^1",["action","set","obj","73fce065-0465-4547-8270-dcd75cb37bfb","key","id","value","000000000000000000000"]],["^1",["action","link","obj","982602ad-8ccc-406a-bd96-39df0b1a71c5","key","starter:1","value","73fce065-0465-4547-8270-dcd75cb37bfb"]],["^1",["action","link","obj","00000000-0000-0000-0000-000000000000","key","value","value","982602ad-8ccc-406a-bd96-39df0b1a71c5"]]]],"actor","starter","seq",1,"deps",["^1",[]],"message","Initialization","undoable",false]]]]';

class PadEditor {
  private slateOpQueue: ExtendedSlate.ExtendedSlateOperation[] = [];
  private replica: Replica<SyncPadDoc>;
  private slateOpsObservable = new Subject<
    ExtendedSlate.ExtendedSlateOperation[]
  >();
  public slateOpsCountObservable = observeSubscriberCount(
    this.slateOpsObservable
  );
  private debouncedProcessLocalSlateOps: () => void;
  private changesSubscription: Subscription;
  private pendingApplySlateOpIds: string[] = [];
  private pendingApplyResolve: ((value: unknown) => void) | null = null;
  private pendingApplyPromise: Promise<unknown> | null = null;
  private queue = fnQueue();

  constructor(public padId: Id, runtime: Runtime, options: PadEditorOptions) {
    this.debouncedProcessLocalSlateOps = debounce(
      this.processLocalSlateOps.bind(this),
      DEBOUNCE_PROCESS_SLATE_OPS
    );

    const initialValue = toSync([
      {
        type: 'p',
        children: [
          {
            text: '',
          },
        ],
        id: '000000000000000000000',
      },
    ]) as SyncPadDoc;

    const replicaOptions = {
      name: uri('pads', padId, 'content'),
      actorId: runtime.actorId,
      userId: runtime.userId,
      sync: runtime.sync,
      initialValue,
      initialStaticValue,
      createIfAbsent: true,
      maxRetryIntervalMs: MAX_RETRY_INTERVAL_MS,
      sendChangesDebounceMs: SEND_CHANGES_DEBOUNCE_MS,
      fetchPrefix,
      storage: options.storage || global.localStorage,
      beforeRemoteChanges: this.beforeRemoteChanges.bind(this),
      startReplicaSync: options.startReplicaSync,
    };
    this.replica = createReplica<SyncPadDoc>(replicaOptions);

    this.changesSubscription = this.replica.remoteChanges.subscribe(
      this.onRemoteChange.bind(this)
    );
  }

  getValue(): SyncPadValue {
    return toJS(this.replica.getValue());
  }

  slateOps(): Observable<ExtendedSlate.ExtendedSlateOperation[]> {
    return this.slateOpsObservable;
  }

  flush() {
    this.processLocalSlateOps();
  }

  stop() {
    this.flush();
    this.slateOpsObservable.complete();
    this.changesSubscription.unsubscribe();
    this.replica.stop();
  }

  /**************************/
  /*** remote changes *******/
  /**************************/

  private beforeRemoteChanges(): Promise<undefined> | void {
    this.processLocalSlateOps();
    if (this.pendingApplyPromise) {
      return this.pendingApplyPromise.then(() => undefined);
    }
  }

  private onRemoteChange({ diffs, doc, before }: ChangeEvent<SyncPadDoc>) {
    const ops = toSlateOps(diffs, doc, before).map(remoteOp);
    this.queue.push(() => this.applyRemoteSlateOps(ops));
  }

  private applyRemoteSlateOps(ops: ExtendedSlate.ExtendedSlateOperation[]) {
    const p = (this.pendingApplyPromise = new Promise((resolve) => {
      this.pendingApplyResolve = resolve;
      if (ops.length > 0) {
        for (const op of ops) {
          this.pendingApplySlateOpIds.push(op.id as string);
        }
        this.slateOpsObservable.next(ops);
      } else {
        resolve(undefined);
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
            const resolve = this.pendingApplyResolve;
            assert(resolve, 'should have pending apply resolve');
            this.pendingApplyResolve = null;
            resolve!.call(null, undefined);
          }
        }
      }
    }
    const localOperations = ops.filter(isNotRemoteOp);
    if (localOperations.length > 0) {
      this.pushLocalSlateOps(localOperations);
    }
  }

  /*************************/
  /*** local changes *******/
  /*************************/

  private pushLocalSlateOps(ops: ExtendedSlate.ExtendedSlateOperation[]) {
    this.slateOpQueue = this.slateOpQueue.concat(ops);
    this.debouncedProcessLocalSlateOps();
  }

  private processLocalSlateOps() {
    const ops = this.slateOpQueue;
    if (ops.length === 0) {
      return;
    }
    this.slateOpQueue = [];
    let applied = false;
    this.replica.mutate((doc) => {
      for (const op of ops) {
        if (!op.isRemote) {
          const applyOp = fromSlateOpType(
            (op as unknown as ExtendedSlate.ExtendedSlateOperation)
              .type as SupportedSlateOpTypes
          );

          if (applyOp) {
            applyOp(doc as SyncPadValue, op);
            applied = true;
          }
        }
      }
    });
    if (applied) {
      this.replica.flush();
    }
  }
}

function remoteOp(op: SlateOperation): ExtendedSlate.ExtendedSlateOperation {
  return { ...op, isRemote: true, id: nanoid() };
}

function isNotRemoteOp(op: ExtendedSlate.ExtendedSlateOperation): boolean {
  return !op.isRemote;
}

export { PadEditor };
