import { Computer, Program } from '@decipad/computer';
import { MyEditor, MyElement } from '@decipad/editor-types';
import { PromiseOrType } from '@decipad/utils';

export type InteractiveLanguageElement = {
  getParsedBlockFromElement?: (
    editor: MyEditor,
    computer: Computer,
    element: MyElement
  ) => PromiseOrType<Program>;
  type: string | string[];
  isStructural?: boolean;
};
