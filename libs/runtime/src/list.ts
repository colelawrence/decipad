import { Observable } from 'rxjs';
import { createReplica, Replica } from './replica';
import { Runtime } from './runtime';

const INITIAL_STATIC_VALUE =
  '["~#iL",[["~#iM",["ops",["^0",[["^1",["action","makeList","obj","ecc6c560-86c6-4384-aed4-ba606a2cce40"]],["^1",["action","link","obj","00000000-0000-0000-0000-000000000000","key","value","value","ecc6c560-86c6-4384-aed4-ba606a2cce40"]]]],"actor","starter","seq",1,"deps",["^1",[]],"message","Initialization","undoable",false]]]]';

export class List {
  replica: Replica<Id[]>;

  constructor(public runtime: Runtime, name: string) {
    this.replica = createReplica<Id[]>(
      name,
      runtime,
      [] as Id[],
      true,
      INITIAL_STATIC_VALUE
    );
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
      const index = ids.indexOf(id);
      if (index >= 0) {
        ids.splice(index, 1);
      }
    });

    await this.replica.flush();
  }

  stop() {
    this.replica.stop();
  }
}
