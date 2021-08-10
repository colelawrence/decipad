import { AnyValue } from '../interpreter/Value';
import { Type } from '../type';

export interface BuiltinSpec {
  argCount: number;
  /**
   * Use this to indicate desired cardinality per argument (1 for 1D, 2 for 2D, etc.)
   * The cardinality of the corresponding args passed to fn and functor will be raised from the default 1.
   */
  argCardinalities?: number[];
  fn?: (...args: any[]) => any;
  // Variant that operates on Value specifically
  fnValues?: (...args: AnyValue[]) => AnyValue;
  functor: (...types: Type[]) => Type;
}
