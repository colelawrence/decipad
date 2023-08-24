import { Result } from '@decipad/computer';
import { ImportElementSource, TableCellType } from '@decipad/editor-types';

export interface ConnectionProps {
  type?: ImportElementSource;
  typeMapping: Array<TableCellType | undefined>;
  setResultPreview: (res: Result.Result | undefined) => void;
}
