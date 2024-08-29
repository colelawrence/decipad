import type { SerializedType } from './SerializedTypes';

export type FormulaGroup =
  | 'Algebra'
  | 'Columns'
  | 'Conditions'
  | 'Correctness'
  | 'Dates'
  | 'Finance'
  | 'Logical'
  | 'Numbers'
  | 'Ranges'
  | 'Tables or Columns'
  | 'Tables'
  | 'Trigonometric'
  | 'Units';

export interface AutocompleteName<
  Kind extends SerializedType['kind'] = SerializedType['kind']
> {
  autocompleteGroup: 'function' | 'variable' | 'column';
  syntax?: string;
  example?: string;
  formulaGroup?: FormulaGroup;
  kind: Kind;
  name: string;
  inTable?: string;
  explanation?: string;
  blockId?: string;
  columnId?: string;
  isLocal?: boolean;
}

export interface AutocompleteNameWithSerializedType<
  Kind extends SerializedType['kind'] = SerializedType['kind']
> extends AutocompleteName<Kind> {
  serializedType: Extract<SerializedType, { kind: Kind }>;
}
