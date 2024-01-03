import DeciNumber from '@decipad/number';
import type { Value } from './Value';
import { Column } from './Column';
import type { ValueGeneratorFunction } from './ValueGenerator';
import { Scalar } from './Scalar';

type ValidFromJSArg =
  | string
  | boolean
  | number
  | bigint
  | Date
  | DeciNumber
  // eslint-disable-next-line @typescript-eslint/ban-types
  | Function;

export type FromJSArg = symbol | undefined | FromJSArg[] | ValidFromJSArg;

const invalidTypes = new Set(['symbol']);

const validateFromJsArg = (thing: FromJSArg): thing is ValidFromJSArg => {
  if (thing == null) {
    throw new TypeError('result cannot be null or undefined');
  }
  if (invalidTypes.has(typeof thing)) {
    throw new TypeError('result cannot be symbol or function');
  }
  return true;
};

export const fromJS = (thing: FromJSArg, defaultValue?: Value): Value => {
  // TODO this doesn't distinguish Range/Date from Column, and it can't possibly do it!
  if (!validateFromJsArg(thing)) {
    throw new TypeError(`invalid result ${thing?.toString()}`);
  }
  if (typeof thing === 'function') {
    return Column.fromGenerator(thing as ValueGeneratorFunction);
  }
  if (!Array.isArray(thing)) {
    return Scalar.fromValue(thing);
  }
  if (thing.length === 0) {
    return Column.fromValues([], defaultValue, []);
  }
  return Column.fromValues(
    thing.map((t) => fromJS(t, defaultValue)),
    defaultValue
  );
};
