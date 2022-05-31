import { TUnit, TUnits } from './unit-type';
import * as SerializedTypes from './SerializedTypes';

export { SerializedTypes };

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
  | SerializedTypes.Function
  | SerializedTypes.TypeError;

export type SerializedTypeKind = SerializedType['kind'];
