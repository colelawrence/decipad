import { DefaultPlatePluginKey } from '@udecode/plate';
// eslint-disable-next-line import/no-self-import
import * as elementTypes from './elementTypes';

export const ELEMENT_IMPORT_DATA = 'import-data';
export const TABLE_INPUT = 'table-input';

export type ElementType =
  | DefaultPlatePluginKey
  | typeof elementTypes[keyof typeof elementTypes];
export type Element =
  | {
      readonly type: ElementType;
      readonly children?: ReadonlyArray<Element>;
    }
  | { readonly text: string };
