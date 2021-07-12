import Automerge, { Doc } from 'automerge';

interface IStoreOptions<T> {
  key: string;
  initialValue: T | null;
  initialStaticValue: string | null;
  actorId: string;
  createIfAbsent: boolean;
  onChange: () => void;
}

export class Store<T> {
  private key: string;
  private initialValue: T | null;
  private initialStaticValue: string | null;
  private actorId: string;
  private createIfAbsent: boolean;
  private onChange: () => void;
  private stopped = false;

  constructor(options: IStoreOptions<T>) {
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
    global.localStorage.setItem(this.key, Automerge.save(doc));
  }

  public delete() {
    global.localStorage.removeItem(this.key);
  }

  public get(): Doc<T> | null {
    let doc: Doc<T> | null = null;
    const localStr = global.localStorage.getItem(this.key);
    let str = localStr;
    if (localStr == null) {
      str = this.initialStaticValue;
    }
    if (str) {
      doc = Automerge.load(str, this.actorId);
    } else if (this.initialValue != null && this.createIfAbsent) {
      doc = Automerge.from(this.initialValue, 'starter') as Doc<T>;
    }
    if (doc !== null) {
      const toBeSaved = Automerge.save(doc);
      if (toBeSaved !== localStr) {
        global.localStorage.setItem(this.key, toBeSaved);
      }
    }

    return doc;
  }

  public stop() {
    this.stopped = true;
    global.removeEventListener('storage', this.onStorageEvent);
  }

  private onStorageEvent(event: StorageEvent) {
    if (this.stopped || event.key !== this.key) {
      return;
    }
    this.onChange.call(null);
  }
}
