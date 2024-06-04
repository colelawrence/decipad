import type { Computer, Program } from '@decipad/computer-interfaces';
import type {
  AnyElement,
  MinimalRootEditor,
  MyEditor,
} from '@decipad/editor-types';
import type { PromiseOrType } from '@decipad/utils';

export type InteractiveLanguageElement = {
  getParsedBlockFromElement?: (
    editor: MinimalRootEditor | MyEditor,
    computer: Computer,
    element: AnyElement
  ) => PromiseOrType<Program>;
  type: string | string[];
  isStructural?: boolean;
};
