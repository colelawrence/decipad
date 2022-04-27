import { Range } from 'slate';
import { DECORATION_CELL_UNIT } from './constants';

export interface DecorationCellUnit extends Range {
  [DECORATION_CELL_UNIT]: true;
  unitString: string;
}
