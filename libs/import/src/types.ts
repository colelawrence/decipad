import { Result } from '@decipad/computer';
import { ImportElementSource } from '@decipad/editor-types';

export interface Provider {
  name: ImportElementSource;
  matchUrl: (url: URL) => boolean;
  import: (url: URL) => Promise<Result.Result>;
}
