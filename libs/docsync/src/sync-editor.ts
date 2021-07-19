import { Observable, Subject, Subscription } from 'rxjs';
import debounce from 'lodash.debounce';
import { Operation as SlateOperation } from 'slate';
import { nanoid } from 'nanoid';
import assert from 'assert';
import { DocSync } from './docsync';
import { createReplica, Replica, ChangeEvent } from '@decipad/replica';
import { fromSlateOpType, SupportedSlateOpTypes } from './from-slate-op';
import { toSlateOps } from './to-slate-ops';
import { toJS } from './utils/to-js';
import { fnQueue } from './utils/fn-queue';
import { observeSubscriberCount } from './utils/observe-subscriber-count';
import initialEditorValue from './utils/initial-editor-value';
import { uri } from './utils/uri';
import { config } from './config';

export interface SyncEditorOptions {
  startReplicaSync?: boolean;
  storage?: Storage;
}

export class SyncEditor {
  private slateOpQueue: ExtendedSlate.ExtendedSlateOperation[] = [];
  private replica: Replica<SyncDocDoc>;
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

  constructor(docId: string, docsync: DocSync, options: SyncEditorOptions) {
    const conf = config();
    this.debouncedProcessLocalSlateOps = debounce(
      this.processLocalSlateOps.bind(this),
      conf.debounceProcessSlateOpsMs
    );

    const replicaOptions = {
      name: uri('pads', docId, 'content'),
      actorId: docsync.actorId,
      userId: docsync.userId,
      sync: docsync.sync,
      initialValue: initialEditorValue.live(),
      initialStaticValue: initialEditorValue.static,
      createIfAbsent: true,
      beforeRemoteChanges: this.beforeRemoteChanges.bind(this),
      startReplicaSync: options.startReplicaSync,
      storage: options.storage || global.localStorage,
      fetchPrefix: conf.fetchPrefix,
      maxRetryIntervalMs: conf.maxRetryIntervalMs,
      sendChangesDebounceMs: conf.sendChangesDebounceMs,
    };
    this.replica = createReplica<SyncDocDoc>(replicaOptions);

    this.changesSubscription = this.replica.remoteChanges.subscribe(
      this.onRemoteChange.bind(this)
    );
  }

  getValue(): SyncValue {
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

  private onRemoteChange({ diffs, doc, before }: ChangeEvent<SyncDocDoc>) {
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
            applyOp(doc as SyncValue, op);
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
