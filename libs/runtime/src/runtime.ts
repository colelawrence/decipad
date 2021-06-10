import { Observable, BehaviorSubject } from 'rxjs';
import { PadEditor } from './pad-editor';
import { Sync } from './sync';
import createExternalWebsocketImpl from './external-websocket';

class Runtime {
  sync = new Sync<AnySyncValue>();
  sessionSubject = new BehaviorSubject<Session | null>(null);
  editors: Map<Id, PadEditor> = new Map();

  constructor(public userId: string, public actorId: string) {}

  startPadEditor(padId: Id, createIfAbsent: boolean) {
    let editor = this.editors.get(padId);
    if (editor === undefined) {
      editor = new PadEditor(padId, this, createIfAbsent);
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
