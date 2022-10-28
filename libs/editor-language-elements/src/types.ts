import { Computer, Program } from '@decipad/computer';
import { MyEditor, MyElement } from '@decipad/editor-types';

export type InteractiveLanguageElement = {
  getParsedBlockFromElement?: (
    editor: MyEditor,
    computer: Computer,
    element: MyElement
  ) => Promise<Program>;
  type: string | string[];
  isStructural?: boolean;
};
