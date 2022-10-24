import { LogicVar } from './LogicVar';
import { Domain } from './Domain';
import { LogicNumber } from './types';

export const isBinding = (v: unknown): v is Binding => v instanceof Binding;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Val = Domain | LogicNumber;

export class Binding {
  readonly type = 'binding';
  variable: LogicVar;
  val: Val;

  constructor(variable: LogicVar, val: Val) {
    // frame is a list of bindings
    this.variable = variable;
    this.val = val;
  }
}

export const makeBinding = (variable: LogicVar, val: Val) =>
  new Binding(variable, val);
