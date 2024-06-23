import type { Result, SerializedType } from '@decipad/language-interfaces';

export interface Column {
  name: string;
  blockId?: string;
  type: SerializedType;
  value?: Result.Result<'materialized-column'>['value'];
}

export type SubMenu = 'aggregate' | 'round' | 'filter';
