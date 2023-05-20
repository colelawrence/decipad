import { TableCellType } from '@decipad/editor-types';
import { UnitsAction } from '../../molecules/UnitMenuItem/UnitMenuItem';

export const typeFromUnitsAction = (
  action: UnitsAction | undefined
): TableCellType | undefined => {
  if (action == null) {
    return undefined;
  }
  switch (action.type) {
    case 'unit':
      return { kind: 'number', unit: action.value };
    case 'constant':
      return { kind: 'constant', constant: action.value };
    case 'text': {
      throw new Error('uncreachable');
    }
  }
};
