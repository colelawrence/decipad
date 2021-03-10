import { ClientReplica } from "./client-replica";
import { Observers } from "./utils/observers";
import { Storage } from "./storage";
import { Operation as SlateOperation } from "./slate";
import { Computer } from "./computer";
import { SyncDoc } from "./model";

export class Context {
  id: string;
  actorId: string;
  storage: Storage;
  replica: ClientReplica;
  observers = new Observers();
  stoppers: Array<() => void> = [];
  computer = new Computer();

  constructor(actorId: string, id: string) {
    this.actorId = actorId;
    this.id = id;
    this.storage = new Storage(id);
    this.replica = new ClientReplica(actorId);
  }

  subscribe(observer: any): () => void {
    return this.observers.subscribe(observer) as () => void;
  }

  start() {
    const cancel = this.replica.subscribe({
      initialContext: (context: any) => {
        this.observers.notify("initialContext", context);
        this.computer.setContext(context);
      },
      changes: () => {
        // NOTHING FOR NOW
      },
      newContext: (context: SyncDoc) => {
        this.computer.setContext(context);
        this.storage.saveAll(this.replica.save());
      },
      slateOps: (ops: SlateOperation[]) => {
        this.observers.notify("slateOps", ops);
      },
    });
    this.stoppers.push(cancel);
    this.replica.start(this.storage.loadAll());
  }

  stop() {
    const stoppers = this.stoppers;
    this.stoppers = [];
    for (const stopper of stoppers) {
      stopper();
    }
  }

  destroy() {
    this.storage.destroyAll();
  }

  sendSlateOperations(operations: SlateOperation[]) {
    this.replica.applySlateOperations(operations);
  }

  compute() {
    this.replica.flushOps();
    return this.computer.compute();
  }

  async resultAt(blockId: string, line: number): Promise<Result.Value> {
    return await this.computer.resultAt(blockId, line);
  }
}
