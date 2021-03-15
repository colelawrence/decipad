export class Storage {
  id: string;
  constructor(id: string) {
    this.id = id;
  }

  saveAll(str: string) {
    window.localStorage.setItem(this._dbKey(), str);
  }

  destroyAll() {
    window.localStorage.removeItem(this._dbKey());
  }

  loadAll() {
    return window.localStorage.getItem(this._dbKey());
  }

  _dbKey() {
    return `doc.${this.id}`;
  }
}
