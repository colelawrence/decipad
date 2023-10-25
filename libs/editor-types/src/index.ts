/* eslint-disable import/newline-after-import */
/* eslint-disable import/first */
import type { SerializedType } from '@decipad/remote-computer';
import * as elementKindsModule from './element-kinds';
import * as markKinds from './mark-kinds';

export * from './column-kinds';
export * from './components';
export * from './data-view';
export * from './decorator-kinds';
export * from './element-kinds';
export * from './event-interception';
export * from './import-data';
export * as IntegrationTypes from './integrations';
export * from './interactive-elements';
export * from './mark-kinds';
export * from './nodes';
export * from './plate';
export * from './table';
export * from './utils';
export * from './value';
export * from './subscription-plans';
export * from './icons';
export * from './slashCommands';
export { markKinds };

import type { TableCellType } from './table';

export type MarkKind = typeof markKinds[keyof typeof markKinds];

export const elementKinds = Object.values(elementKindsModule);
export type ElementKind =
  typeof elementKindsModule[keyof typeof elementKindsModule];

export const alwaysWritableElementTypes = [
  elementKindsModule.ELEMENT_TABLE,
  elementKindsModule.ELEMENT_VARIABLE_DEF,
  elementKindsModule.ELEMENT_COLUMNS,
];

export const allElementKinds: readonly string[] = Object.freeze(
  Object.values(elementKinds)
);

export type CellValueType = TableCellType | SerializedType;
