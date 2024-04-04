import type { AST } from '..';
import type { Value } from './Value';

export class FunctionValue implements Value {
  argumentNames: string[];
  body: AST.Block;

  constructor(argumentNames: string[], body: AST.Block) {
    this.argumentNames = argumentNames;
    this.body = body;
  }

  static from(argumentNames: string[], body: AST.Block): FunctionValue {
    return new FunctionValue(argumentNames, body);
  }

  async getData() {
    return Promise.resolve(this);
  }
}
