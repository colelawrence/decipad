export class Observers {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
    const cancel = () => {
      const index = this.observers.indexOf(observer);
      this.observers.splice(index, 1);
    };
    return cancel;
  }

  notify(methodName, ...args) {
    for (const observer of this.observers) {
      const method = observer[methodName];
      if (!method) {
        console.error(`No such method in observer: ${methodName}`);
        return;
      }
      method.apply(observer, args);
    }
  }
}