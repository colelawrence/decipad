import {
  AnyElement,
  ELEMENT_CODE_LINE,
  MinimalRootEditor,
  MyEditor,
} from '@decipad/editor-types';
import { RemoteComputer } from '@decipad/remote-computer';
import { getCodeLineSource } from '@decipad/editor-utils';
import { InteractiveLanguageElement } from '../types';
import { parseElementAsSourceCode } from '../utils/parseElementAsSourceCode';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';

export const getUnparsedBlockFromCodeLine = (
  _editor: MinimalRootEditor | MyEditor,
  _computer: RemoteComputer,
  block: AnyElement
) => {
  if (block.type === ELEMENT_CODE_LINE) {
    return parseElementAsSourceCode(block.id, getCodeLineSource(block));
  }
  return [];
};

export const CodeLine: InteractiveLanguageElement = {
  type: ELEMENT_CODE_LINE,
  getParsedBlockFromElement: weakMapMemoizeInteractiveElementOutput(
    getUnparsedBlockFromCodeLine
  ),
};
