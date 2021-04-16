import { Observable, BehaviorSubject } from 'rxjs'
import { Workspaces } from './workspaces'
import { Pads } from './pads'

interface WorkspacePads {
  pads: Pads
}

class Runtime {
  workspaces = new Workspaces(this)
  sessionSubject = new BehaviorSubject<Session | null>(null)
  workspaceById = new Map<Id, WorkspacePads>()

  constructor(public userId: string, public actorId: string) {
  }

  workspace(workspaceId: Id): WorkspacePads {
    let ws = this.workspaceById.get(workspaceId)
    if (ws === undefined) {
      ws = {
        pads: new Pads(this, workspaceId)
      }
      this.workspaceById.set(workspaceId, ws)
    }
    return ws
  }

  setSession(session: Session) {
    this.sessionSubject.next(session)
  }

  getSession(): Observable<Session | null> {
    return this.sessionSubject
  }

  getSessionValue(): Session | null {
    return this.sessionSubject.getValue()
  }

  stop() {
    this.sessionSubject.next(null)
    this.sessionSubject.complete()
    this.workspaces.stop()
    for (const ws of this.workspaceById.values()) {
      ws.pads.stop()
      this.workspaceById.clear()
    }
  }
}

export { Runtime }
