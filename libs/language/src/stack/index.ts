import { immerable } from 'immer';
import { AnyMapping, anyMappingToMap } from '../utils';

export class Stack<T> {
  [immerable] = true;
  stack: Array<Map<string, T>>;

  constructor(initialGlobalScope: AnyMapping<T> = new Map()) {
    this.stack = [];
    this.push(anyMappingToMap(initialGlobalScope));
  }

  push(mapInit: AnyMapping<T> = new Map()) {
    this.stack.push(anyMappingToMap(mapInit));
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

    return null;
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
