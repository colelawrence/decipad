import { immerable } from 'immer';

export class Stack<T> {
  [immerable] = true;
  stack: Array<Map<string, T>>;

  constructor(mapInit?: Array<[string, T]>) {
    this.stack = [];
    this.push(mapInit);
  }

  push(mapInit?: Array<[string, T]>) {
    this.stack.push(new Map(mapInit));
  }

  pop() {
    this.stack.pop();

    if (this.stack.length === 0) {
      throw new Error('panic: stack became empty');
    }
  }

  get top(): Map<string, T> {
    return this.stack[this.stack.length - 1];
  }

  set(varName: string, value: T) {
    this.top.set(varName, value);
  }

  has(varName: string) {
    return this.stack.some((map) => map.has(varName));
  }

  get(varName: string) {
    for (let i = this.stack.length - 1; i >= 0; i--) {
      const value = this.stack[i].get(varName);
      if (value != null) return value;
    }

    throw new Error('panic: not found in stack: ' + varName);
  }

  delete(varName: string) {
    for (let i = this.stack.length - 1; i >= 0; i--) {
      if (this.stack[i].has(varName)) {
        this.stack[i].delete(varName);
        return;
      }
    }
  }

  async withPush<T>(wrapper: () => T | Promise<T>): Promise<T> {
    try {
      this.push();

      return await wrapper();
    } finally {
      this.pop();
    }
  }
}
