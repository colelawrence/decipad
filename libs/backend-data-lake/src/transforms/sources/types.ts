import type { JSONSchema7TypeName as JSONSchemaTypeName } from 'json-schema';
import { DataRealm, DataSource } from '../../types';

export type AugmentedJSONSchemaTypeName = JSONSchemaTypeName | 'timestamp';

export type TargetColumn = {
  name: string;
  type: AugmentedJSONSchemaTypeName;
  isNullable: boolean;
  description: string;
  items?: {
    type: AugmentedJSONSchemaTypeName;
  };
};

export type TargetTable = {
  tableName: string;
  description: string;
  columns: TargetColumn[];
};

export type SourceTransform = {
  realm: DataRealm;
  source: DataSource;
  sourceTableNames: string[];
  targetTables: TargetTable[];
  getTargetTableTransformTemplate: (targetTableName: string) => string;
  sourceIdColumn: (sourceTableName: string) => string;
};
