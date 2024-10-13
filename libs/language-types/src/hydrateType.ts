import type { SerializedType, Unit } from '@decipad/language-interfaces';
import { N } from '@decipad/number';

export const hydrateUnit = (u: Unit): Unit => ({
  ...u,
  exp: N(u.exp),
  multiplier: N(u.multiplier),
  aliasFor: u.aliasFor && u.aliasFor.map(hydrateUnit),
});

export const hydrateType = (type: SerializedType): SerializedType => {
  switch (type.kind) {
    case 'number': {
      return {
        ...type,
        unit: type.unit?.map(hydrateUnit) ?? null,
      } as SerializedType;
    }
    case 'column':
    case 'materialized-column':
      return {
        ...type,
        cellType: hydrateType(type.cellType),
      };
    case 'table':
    case 'materialized-table':
      return {
        ...type,
        columnTypes: type.columnTypes.map(hydrateType),
      };
    case 'tree':
      return {
        ...type,
        columnTypes: type.columnTypes.map(hydrateType),
      };
    case 'row':
      return {
        ...type,
        rowCellTypes: type.rowCellTypes.map(hydrateType),
      };
    case 'range':
      return {
        ...type,
        rangeOf: hydrateType(type.rangeOf),
      };
    case 'trend':
      return {
        ...type,
        trendOf: hydrateType(type.trendOf),
      };
    default:
      return type;
  }
};
