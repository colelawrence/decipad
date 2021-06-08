import { Subject, Observable } from 'rxjs';
import { Runtime } from './runtime';
import { List } from './list';
import { invertedIndex, InvertedIndex } from './inverted-index';
import { Replica, createReplica } from './replica';
import { PadEditor } from './pad-editor';
import { LocalMetadata } from './local-metadata';
import { uri } from './utils/uri';

export class Pads extends List {
  pads: Map<Id, Replica<Pad>> = new Map();
  editors: Map<Id, PadEditor> = new Map();
  byTag: InvertedIndex;
  mutationsObservable = new Subject<Mutation<Pad>>();
  meta: Map<Id, LocalMetadata> = new Map();

  constructor(runtime: Runtime, workspaceId: Id) {
    super(runtime, uri('workspaces', workspaceId, 'pads'));

    this.byTag = invertedIndex<Pad>(
      uri('workspaces', workspaceId, 'padsByTag'),
      runtime,
      this.mutationsObservable,
      (pad) => pad.tags
    );

    for (const id of this.replica.getValue()!) {
      const value = this.getPadReplica(id).getValue();
      if (value !== null) {
        this.mutationsObservable.next({ before: null, after: value });
      }
    }
  }

  edit(padId: Id) {
    let editor = this.editors.get(padId);
    if (editor === undefined) {
      const meta = this.getPadMeta(padId);
      const createIfAbsent = meta.get('createdLocally');
      editor = new PadEditor(padId, this.runtime, createIfAbsent);
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

  async create(pad: Pad) {
    const replica = this.getPadReplica(pad.id, true);
    const before = replica.getValue();
    const after = replica.mutate(() => pad);
    await replica.flush();
    await this.push(pad.id);
    const meta = this.getPadMeta(pad.id);
    meta.set('createdLocally', true);
    this.mutationsObservable.next({ before, after });
  }

  async update(id: Id, pad: Partial<Pad>) {
    const replica = this.getPadReplica(id);
    const before = replica.getValue();
    const after = replica.mutate((padBefore) => {
      Object.assign(padBefore, pad);
    });
    await replica.flush();
    this.mutationsObservable.next({ before, after });
  }

  async removePad(padId: Id) {
    const replica = this.getPadReplica(padId);
    const before = replica.getValue();
    await replica.remove();
    await this.remove(padId);
    this.mutationsObservable.next({ before, after: null });
  }

  get(padId: Id): Observable<AsyncSubject<Pad>> {
    return this.getPadReplica(padId).observable;
  }

  stop() {
    this.mutationsObservable.complete();
    for (const pad of this.pads.values()) {
      pad.stop();
    }
    this.pads.clear();
    this.byTag.stop();
  }

  private getPadReplica(id: Id, createIfAbsent = false): Replica<Pad> {
    let replica = this.pads.get(id);
    if (replica === undefined) {
      replica = createReplica<Pad>(
        uri('pads', id),
        this.runtime,
        null,
        createIfAbsent
      );
      let firstZeroHappened = false;
      replica.subscriptionCountObservable.subscribe((subscriberCount) => {
        if (subscriberCount === 0) {
          if (firstZeroHappened) {
            replica!.stop();
            this.pads.delete(id);
          } else {
            firstZeroHappened = true;
          }
        }
      });
      this.pads.set(id, replica);
    }
    return replica;
  }

  private getPadMeta(padId: Id): LocalMetadata {
    let meta = this.meta.get(padId);
    if (meta === undefined) {
      meta = new LocalMetadata(`${this.runtime.userId}:pad:${padId}:meta`);
      this.meta.set(padId, meta);
    }
    return meta;
  }
}
