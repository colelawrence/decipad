import type { Computer } from '@decipad/computer-interfaces';
import type { ImportElementSource, MyEditor } from '@decipad/editor-types';
import type { PromiseOrType } from '@decipad/utils';
import type { Path } from 'slate';

export type GetAvailableIdentifier = (
  prefix: string,
  start?: number
) => PromiseOrType<string>;

export interface InsertLiveConnectionProps {
  readonly computer: Computer;
  readonly editor: MyEditor;
  readonly source?: ImportElementSource;
  readonly fileName?: string;
  readonly url?: string;
  readonly identifyIslands?: boolean;
  readonly path?: Path;
}
