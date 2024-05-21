import type * as SerializedTypes from './SerializedTypes';

export type { SerializedTypes };

export type SerializedType =
  // Groups
  | SerializedTypes.Column
  | SerializedTypes.MaterializedColumn
  | SerializedTypes.Table
  | SerializedTypes.Tree
  | SerializedTypes.MaterializedTable
  | SerializedTypes.Row

  // Non-groups
  | SerializedTypes.Number
  | SerializedTypes.Boolean
  | SerializedTypes.String
  | SerializedTypes.Date
  | SerializedTypes.Range

  // Oddball
  | SerializedTypes.Pending
  | SerializedTypes.Nothing // No-op
  | SerializedTypes.Anything
  | SerializedTypes.Function
  | SerializedTypes.TypeError;

export type SerializedTypeKind = SerializedType['kind'];
