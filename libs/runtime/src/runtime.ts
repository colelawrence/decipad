import { Observable, BehaviorSubject } from 'rxjs';
import { PadEditor } from './pad-editor';
import { Sync } from './sync';
import createExternalWebsocketImpl from './external-websocket';

interface RuntimeConstructorOptions {
  userId: string;
  actorId: string;
  isSynced?: boolean;
}

class Runtime {
  userId: string;
  actorId: string;
  isSynced: boolean;

  sync: Sync<AnySyncValue>;
  sessionSubject = new BehaviorSubject<Session | null>(null);
  editors: Map<Id, PadEditor> = new Map();

  constructor({ userId, actorId, isSynced = true }: RuntimeConstructorOptions) {
    this.userId = userId;
    this.actorId = actorId;
    this.isSynced = isSynced;
    this.sync = new Sync({ start: isSynced });
  }

  startPadEditor(padId: Id) {
    let editor = this.editors.get(padId);
    if (editor === undefined) {
      editor = new PadEditor(padId, this, this.isSynced);
      let hadSubscribers = false;
      editor.slateOpsCountObservable.subscribe((subscriptionCount) => {
        if (subscriptionCount === 0) {
          if (hadSubscribers) {
            editor!.stop();
            this.editors.delete(padId);
          }
        } else {
          hadSubscribers = true;
        }
      });
      this.editors.set(padId, editor);
    }
    return editor;
  }

  setSession(session: Session) {
    this.sessionSubject.next(session);
  }

  getSession(): Observable<Session | null> {
    return this.sessionSubject;
  }

  getSessionValue(): Session | null {
    return this.sessionSubject.getValue();
  }

  websocketImpl(): typeof WebSocket {
    return createExternalWebsocketImpl(this.sync);
  }

  stop() {
    this.sync.stop();
    this.sessionSubject.next(null);
    this.sessionSubject.complete();
    for (const editor of this.editors.values()) {
      editor.stop();
    }
  }
}

export { Runtime };
