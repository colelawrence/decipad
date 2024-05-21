import type { SerializedType } from './SerializedType';

export interface AutocompleteName {
  kind: 'function' | 'variable' | 'column';
  syntax?: string;
  example?: string;
  formulaGroup?: string;
  type: SerializedType;
  name: string;
  inTable?: string;
  explanation?: string;
  blockId?: string;
  columnId?: string;
  isLocal?: boolean;
}
