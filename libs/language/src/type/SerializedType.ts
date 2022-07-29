import type { TUnit, TUnits } from './unit-type';
import * as SerializedTypes from './SerializedTypes';
import { Type } from '.';

export type { SerializedTypes };

export interface SerializedFraction {
  n: bigint;
  d: bigint;
  s: bigint;
}

export type SerializedUnit = TUnit<SerializedFraction>;
export type SerializedUnits = TUnits<SerializedFraction>;

export type SerializedType =
  // Groups
  | SerializedTypes.Column
  | SerializedTypes.Table
  | SerializedTypes.Row

  // Non-groups
  | SerializedTypes.Number
  | SerializedTypes.Boolean
  | SerializedTypes.String
  | SerializedTypes.Date
  | SerializedTypes.Range

  // Oddball
  | SerializedTypes.Nothing // No-op
  | SerializedTypes.Anything
  | SerializedTypes.Function
  | SerializedTypes.TypeError;

export type SerializedTypeKind = SerializedType['kind'];

export const isSerializedType = (thing: unknown): thing is SerializedType => {
  return (
    !(thing instanceof Type) &&
    typeof thing === 'object' &&
    thing !== null &&
    'kind' in thing
  );
};
