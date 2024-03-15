import { Result, SerializedType } from '@decipad/language-types';

export interface Column {
  name: string;
  blockId?: string;
  type: SerializedType;
  value: Result.Result<'materialized-column'>['value'];
}

export type SubMenu = 'aggregate' | 'round' | 'filter';
