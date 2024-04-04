import type { RemoteComputer, Program } from '@decipad/remote-computer';
import type {
  AnyElement,
  MinimalRootEditor,
  MyEditor,
} from '@decipad/editor-types';
import type { PromiseOrType } from '@decipad/utils';

export type InteractiveLanguageElement = {
  getParsedBlockFromElement?: (
    editor: MinimalRootEditor | MyEditor,
    computer: RemoteComputer,
    element: AnyElement
  ) => PromiseOrType<Program>;
  type: string | string[];
  isStructural?: boolean;
};
