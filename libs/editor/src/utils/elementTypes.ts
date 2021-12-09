import { DefaultPlatePluginKey, ELEMENT_LIC } from '@udecode/plate';
// eslint-disable-next-line import/no-self-import
import * as elementTypes from './elementTypes';

type FixedDefaultPlatePluginKey = DefaultPlatePluginKey | typeof ELEMENT_LIC;

export const ELEMENT_IMPORT_DATA = 'import-data';
export const TABLE_INPUT = 'table-input';

export type ElementType =
  | FixedDefaultPlatePluginKey
  | typeof elementTypes[keyof typeof elementTypes];
export type Element =
  | {
      readonly type: ElementType;
      readonly children?: ReadonlyArray<Element>;
    }
  | { readonly text: string };
