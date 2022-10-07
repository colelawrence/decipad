import { Computer } from '@decipad/computer';
import {
  ELEMENT_SMART_REF,
  MyEditor,
  SmartRefElement,
} from '@decipad/editor-types';
import { isFlagEnabled } from '@decipad/feature-flags';
import { insertNodes, insertText } from '@udecode/plate';
import { nanoid } from 'nanoid';

interface ParseIdentifierResult {
  isColumn: boolean;
  baseRef: string;
  rest?: string;
}

const parseIdentifier = (identifier: string): ParseIdentifierResult => {
  let baseRef = identifier;
  const isColumnIndex = identifier.indexOf('.');
  let rest: string | undefined;
  if (isColumnIndex > 0) {
    baseRef = identifier.slice(0, isColumnIndex);
    rest = identifier.slice(isColumnIndex);
  }
  return {
    isColumn: isColumnIndex > 0,
    baseRef,
    rest,
  };
};

export const insertSmartRefOrText = (
  editor: MyEditor,
  computer: Computer,
  identifier: string
) => {
  const { baseRef, rest } = parseIdentifier(identifier);
  const blockId = computer.getVarBlockId(baseRef);

  if (blockId && isFlagEnabled('EXPR_REFS')) {
    const smartRef: SmartRefElement = {
      id: nanoid(),
      type: ELEMENT_SMART_REF,
      blockId,
      children: [{ text: '' }],
    };

    insertNodes(editor, [smartRef, { text: rest ?? '' }]);
  } else {
    insertText(editor, identifier);
  }
};
