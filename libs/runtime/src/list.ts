import { Observable } from 'rxjs';
import { createReplica, Replica } from './replica';
import { Runtime } from './runtime'

export class List {
  replica: Replica<Id[]>;

  constructor(public runtime: Runtime, name: string, initialStaticValue: string | null = null) {
    const initialValue = [] as Id[];
    this.replica = createReplica(name, runtime, initialValue, true, initialStaticValue);
  }

  list(): Observable<AsyncSubject<Id[]>> {
    return this.replica.observable;
  }

  async insertAt(index: number, id: Id) {
    this.replica.mutate((ids: Sync.List<Id>) => {
      ids!.insertAt!(index, id);
    });
    await this.replica.flush();
  }

  async push(id: Id) {
    this.replica.mutate((ids) => {
      ids.push(id);
    });
    await this.replica.flush();
  }

  async remove(id: Id): Promise<void> {
    this.replica.mutate((ids: Id[]) => {
      const index = ids.indexOf(id)
      if (index < 0) {
        throw new Error(`element with id ${id} not found`)
      }
      ids.splice(index, 1);
    });

    await this.replica.flush()
  }

  stop() {
    this.replica.stop();
  }
}