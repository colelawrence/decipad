/* eslint-disable import/newline-after-import */
/* eslint-disable import/first */
import type { SerializedType } from '@decipad/language-interfaces';
import * as elementKindsModule from './element-kinds';
import * as markKinds from './mark-kinds';
import type { TableCellType } from './value';

export * from './column-kinds';
export * from './components';
export * from './data-view';
export * from './decorator-kinds';
export * from './element-kinds';
export * from './import-data';
export * as IntegrationTypes from './integrations';
export * from './mark-kinds';
export * from './nodes';
export * from './plate';
export * from './utils';
export * from './value';
export * from './subscription-plans';
export * from './icons';
export * from './slashCommands';
export { markKinds };

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

export type AvailableSwatchColor =
  | 'Catskill'
  | 'Sulu'
  | 'Sun'
  | 'Grapefruit'
  | 'Rose'
  | 'Perfume'
  | 'Malibu';
