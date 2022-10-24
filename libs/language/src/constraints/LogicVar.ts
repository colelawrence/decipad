import { hasType } from './utils';

export interface LogicVar {
  type: 'logic_var';
  name?: string;
}

export const isLvar = (v: unknown): v is LogicVar => hasType(v, 'logic_var');
export const lvar = (name?: string): LogicVar => ({ type: 'logic_var', name });
