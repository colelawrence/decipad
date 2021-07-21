import Automerge, { Doc } from 'automerge';
import { Subscription, Observable } from 'rxjs';
import { ReplicaStorage, ReplicationStatus } from '@decipad/interfaces';

interface IStoreOptions<T> {
  storage: ReplicaStorage;
  key: string;
  initialValue: T | null;
  initialStaticValue: string | null;
  actorId: string;
  createIfAbsent: boolean;
  onChange: () => void;
}

export class Store<T> {
  private storage: ReplicaStorage;
  private key: string;
  private initialValue: T | null;
  private initialStaticValue: string | null;
  private actorId: string;
  private createIfAbsent: boolean;
  private onChange: () => void;
  private stopped = false;
  private mutating = false;
  private replicationStatusSubscription: Subscription | null = null;

  constructor(options: IStoreOptions<T>) {
    this.storage = options.storage;
    this.key = options.key;
    this.initialValue = options.initialValue;
    this.initialStaticValue = options.initialStaticValue;
    this.actorId = options.actorId;
    this.createIfAbsent = options.createIfAbsent;
    this.onChange = options.onChange;

    this.onStorageEvent = this.onStorageEvent.bind(this);
    global.addEventListener('storage', this.onStorageEvent);
  }

  public put(doc: Doc<T>) {
    this.mutating = true;
    const staticValue = Automerge.save(doc);
    this.storage.setItem(this.key, staticValue);
    this.mutating = false;
  }

  public delete() {
    this.mutating = true;
    this.storage.removeItem(this.key);
    this.mutating = false;
  }

  public get(): Doc<T> | null {
    let doc: Doc<T> | null = null;
    const localStr = this.storage.getItem(this.key);
    let needsCreate = false;

    let str = localStr;
    if (localStr == null) {
      needsCreate = true;
      str = this.initialStaticValue;
    }
    if (str) {
      doc = Automerge.load(str, this.actorId);
    } else if (this.initialValue != null && this.createIfAbsent) {
      needsCreate = true;
      doc = Automerge.from(this.initialValue, 'starter') as Doc<T>;
    }
    if (needsCreate) {
      const toBeSaved = Automerge.save(doc!);
      this.storage.setItem(this.key, toBeSaved);
    }

    return doc;
  }

  public setReplicationStatus(
    replicationStatus: Observable<ReplicationStatus>
  ) {
    if (this.replicationStatusSubscription) {
      this.replicationStatusSubscription.unsubscribe();
    }
    this.replicationStatusSubscription = replicationStatus.subscribe(
      (status) => {
        this.storage.setReplicationStatus(this.key, status);
      }
    );
  }

  public stop() {
    this.stopped = true;
    global.removeEventListener('storage', this.onStorageEvent);
    if (this.replicationStatusSubscription) {
      this.replicationStatusSubscription.unsubscribe();
    }
  }

  private onStorageEvent(event: StorageEvent) {
    if (this.stopped || event.key !== this.key || this.mutating) {
      return;
    }
    this.onChange.call(null);
  }
}
