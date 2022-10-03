/* eslint-disable import/newline-after-import */
/* eslint-disable import/first */
import { SerializedType } from '@decipad/computer';

export * from './decorator-kinds';

export * from './mark-kinds';
import * as markKinds from './mark-kinds';
import * as elementKindsModule from './element-kinds';
export { markKinds };

import type { TableCellType } from './table';

export type MarkKind = typeof markKinds[keyof typeof markKinds];

export * from './decorator-kinds';
export * from './element-kinds';
export const elementKinds = Object.values(elementKindsModule);
export type ElementKind =
  typeof elementKindsModule[keyof typeof elementKindsModule];

export * from './interactive-elements';
export * from './value';
export * from './table';
export * from './components';
export * from './data-view';
export * from './utils';
export * from './nodes';
export * from './plate';

export const alwaysWritableElementTypes = [
  elementKindsModule.ELEMENT_TABLE,
  elementKindsModule.ELEMENT_VARIABLE_DEF,
  elementKindsModule.ELEMENT_COLUMNS,
];

export const allElementKinds: readonly string[] = Object.freeze(
  Object.values(elementKinds)
);

export type CellValueType = TableCellType | SerializedType;
