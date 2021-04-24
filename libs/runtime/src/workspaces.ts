import { Observable } from 'rxjs';
import { Runtime } from './runtime';
import { createReplica, Replica } from './replica';
import { List } from './list';
import { uri } from './utils/uri'

class Workspaces extends List {
  workspaces: Map<Id, Replica<Workspace>> = new Map()

  constructor(public runtime: Runtime) {
    super(runtime, '/workspaces')
  }

  get(id: Id): Observable<AsyncSubject<Workspace>> {
    return this.getWorkspaceReplica(id).observable
  }

  async create(workspace: Workspace) {
    const replica = this.getWorkspaceReplica(workspace.id, true)
    replica.mutate(() => workspace)
    await replica.flush()
  }

  async update(workspaceId: Id, workspaceUpdate: Partial<Workspace>) {
    const replica = this.getWorkspaceReplica(workspaceId)
    replica.mutate((workspace: Workspace) => {
      Object.assign(workspace, workspaceUpdate);
    });
    await this.replica.flush();
  }

  async remove(workspaceId: Id): Promise<void> {
    await this.getWorkspaceReplica(workspaceId).remove()
    await super.remove(workspaceId)
  }

  getWorkspaceReplica(id: Id, create = false): Replica<Workspace> {
    let replica = this.workspaces.get(id)
    if (replica === undefined) {
      replica = createReplica<Workspace>(uri('workspaces', id), this.runtime, null, create)
      this.workspaces.set(id, replica)
    }
    return replica
  }

  stop() {
    super.stop()
    for (const workspaceReplica of this.workspaces.values()) {
      workspaceReplica.stop()
    }
  }
}

export { Workspaces };
