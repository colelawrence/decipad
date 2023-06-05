import { Result } from '@decipad/computer';
import { ImportElementSource } from '@decipad/editor-types';

export interface ConnectionProps {
  type?: ImportElementSource;
  setResultPreview: (res: Result.Result | undefined) => void;
}
