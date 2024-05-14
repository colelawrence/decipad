import type { Result } from '@decipad/remote-computer';
import type { ImportElementSource, TableCellType } from '@decipad/editor-types';

export interface ConnectionProps {
  workspaceId: string;
  type?: ImportElementSource;
  typeMapping: Array<TableCellType | undefined>;

  setResultPreview: (res: Result.Result | undefined) => void;
  setRawResult: (res: string) => void;

  getConnState: () => string;
}
