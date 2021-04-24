import { uri } from './utils/uri';

export class LocalMetadata {

  constructor (private baseName: string) {}

  get(prop: keyof DocMetadata) {
    const meta = this.load();
    return meta[prop];
  }

  set(prop: keyof DocMetadata, value: DocMetadata[typeof prop]) {
    const meta = this.load();
    meta[prop] = value;
    window.localStorage.setItem(this.key(), JSON.stringify(meta));
  }

  private key() {
    return uri(this.baseName, 'meta');
  }

  private load(): DocMetadata {
    let doc: DocMetadata;
    const docStr = window.localStorage.getItem(this.key());
    if (docStr === null) {
      doc = this.init()
    } else {
      doc = JSON.parse(docStr) as DocMetadata
    }
    return doc
  }

  private init(): DocMetadata {
    const doc = {
      createdLocally: false
    }
    window.localStorage.setItem(this.key(), JSON.stringify(doc))
    return doc
  }
}
