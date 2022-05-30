/* eslint-disable import/newline-after-import */
/* eslint-disable import/first */

export * from './decorator-kinds';

export * from './mark-kinds';
import * as markKinds from './mark-kinds';
import * as elementKinds from './element-kinds';

export { markKinds };
export type MarkKind = typeof markKinds[keyof typeof markKinds];

export * from './decorator-kinds';
export * from './element-kinds';
export type ElementKind = typeof elementKinds[keyof typeof elementKinds];

export * from './interactive-elements';
export * from './value';
export * from './table';
export * from './tables-legacy';
export * from './components';
export * from './power-table';
export * from './utils';
export * from './node';
export * from './plate';

export const alwaysWritableElementTypes = [
  elementKinds.ELEMENT_TABLE,
  elementKinds.ELEMENT_VARIABLE_DEF,
];
