import { RemoteComputer, Program } from '@decipad/remote-computer';
import { MyEditor, MyElement } from '@decipad/editor-types';
import { PromiseOrType } from '@decipad/utils';

export type InteractiveLanguageElement = {
  getParsedBlockFromElement?: (
    editor: MyEditor,
    computer: RemoteComputer,
    element: MyElement
  ) => PromiseOrType<Program>;
  type: string | string[];
  isStructural?: boolean;
};
