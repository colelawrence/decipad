import { Observable, Subject, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
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

class PadEditor {
  private slateOpQueue: SlateOperation[] = [];
  private replica: Replica<SyncPadDoc>
  private slateOpsObservable = new Subject<SlateOperation[]>()
  public slateOpsCountObservable = observeSubscriberCount(this.slateOpsObservable)
  private debouncedProcessSlateOps: () => void
  private computer: Computer
  private changesSubscription: Subscription
  private pendingApplySlateOpIds: string[] = []
  private pendingApplyResolve: ((value: unknown) => void) | null = null
  private pendingApplyPromise: Promise<unknown> | null = null
  private queue = fnQueue();

  constructor(public padId: Id, runtime: Runtime, createIfAbsent: boolean) {
    this.processSlateOps = this.processSlateOps.bind(this);
    this.debouncedProcessSlateOps = debounce(this.processSlateOps, 500);

    const defaultInitialValue = toSync([
      {
        children: [
          {
            children: [
              {
                type: 'paragraph',
                text: '',
                id: nanoid()
              },
            ],
          },
        ]
      }
    ]) as SyncPadDoc;

    this.replica = createReplica<SyncPadDoc>(uri('pads', padId, 'content'), runtime, defaultInitialValue, createIfAbsent);
    this.computer = new Computer(this.replica);
    this.replica.beforeRemoteChanges = () => {
      this.processSlateOps()
      return this.pendingApplyPromise
    }
    this.changesSubscription = this.replica.remoteChanges.subscribe(({ diffs, doc, before }) => {
      const ops = toSlateOps(diffs, doc, before).map(remoteOp)
      this.queue.push(() => this.applySlateOps(ops))
    });
  }

  isOnlyRemote(): boolean {
    return this.replica.isOnlyRemote();
  }

  getValue(): SyncPadDoc {
    return toJS(this.replica.getValue())
  }

  getValueEventually(): Promise<SyncPadDoc> {
    return new Promise((resolve, reject) => {
      const value = this.getValue();
      if (value !== null) {
        resolve(value)
        return;
      }
      this.replica.observable.pipe(
        first(({ error, data }) => error !== null || data !== null))
        .subscribe(({ error, data }) => {
          if (error !== null) {
            reject(error)
          } else {
            resolve(toJS(data))
          }
        })
    })
  }

  slateOps(): Observable<SlateOperation[]> {
    return this.slateOpsObservable
  }

  applySlateOps(ops: SlateOperation[]) {
    const p  = this.pendingApplyPromise = new Promise((resolve) => {
      this.pendingApplyResolve = resolve
      if (ops.length > 0) {
        for (const op of ops) {
          this.pendingApplySlateOpIds.push(op.id as string)
        }
        this.slateOpsObservable.next(ops)
      } else {
        resolve(null)
      }
    })
    return p
  }

  sendSlateOperations(ops: SlateOperation[]) {
    for (const op of ops) {
      if (op.id) {
        const index = this.pendingApplySlateOpIds.indexOf(op.id as string)
        if (index >= 0) {
          this.pendingApplySlateOpIds.splice(index, 1)
          if (this.pendingApplySlateOpIds.length === 0) {
            this.pendingApplyResolve!.call(null)
          }
        }
      }
    }
    const operations = ops.filter(isNotRemoteOp)
    if (operations.length > 0) {
      this.slateOpQueue = this.slateOpQueue.concat(operations)
      this.debouncedProcessSlateOps()
    }
  }

  stop() {
    this.flush()
    this.slateOpsObservable.complete()
    this.changesSubscription.unsubscribe()
    this.replica.stop()
  }

  processSlateOps() {
    const ops = this.slateOpQueue;
    if (ops.length === 0) {
      return
    }
    this.slateOpQueue = [];
    let applied = false;
    this.replica.mutate((doc) => {
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

        applyOp(doc as SyncPadValue, op);
        applied = true
      }
    })
    if (applied) {
      this.replica.flush()
      this.computer.reset()
    }
  }

  flush() {
    this.processSlateOps()
  }

  resultAt(blockId: string, line: number): Promise<ComputationResult> {
    this.flush()
    return this.computer.resultAt(blockId, line)
  }
}

function remoteOp(op: SlateOperation): SlateOperation {
  op.isRemote = true
  op.id = nanoid()
  return op
}

function isNotRemoteOp(op: SlateOperation): boolean {
  return !op.isRemote
}

export { PadEditor }