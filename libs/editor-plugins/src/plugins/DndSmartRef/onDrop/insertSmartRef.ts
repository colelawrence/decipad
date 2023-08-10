import { getExprRef, parseStatement } from '@decipad/computer';
import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CALLOUT,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_LIC,
  ELEMENT_PARAGRAPH,
  ELEMENT_SMART_REF,
  ELEMENT_TABLE_COLUMN_FORMULA,
  MARK_MAGICNUMBER,
  MyElement,
  RichText,
  SmartRefElement,
} from '@decipad/editor-types';
import { last } from '@decipad/utils';
import { nanoid } from 'nanoid';
import { Text } from 'slate';

/**
 * Attempt to parse surrounded with +, suffixed with +, and prefixed with +.
 * The first good parse gets used.
 *
 * Allows people to drag "a + b + c" without using the keyboard
 */
const surroundWithPlusSigns = (
  precedingText: string,
  followingText: string
) => {
  const hypotheses = [
    [' + ', ' + '],
    [' ', ' + '],
    [' + ', ' '],
  ];
  for (let [textBefore, textAfter] of hypotheses) {
    if (
      parseStatement(
        `${precedingText + textBefore}smartRef${textAfter}${followingText}`
      ).solution
    ) {
      if (textBefore[0] === ' ' && last(precedingText) === ' ') {
        textBefore = textBefore.slice(1);
      }
      if (last(textAfter) === ' ' && followingText[0] === ' ') {
        textAfter = textAfter.slice(0, -1);
      }
      return { textBefore, textAfter };
    }
  }

  return { textBefore: ' ', textAfter: ' ' };
};

export function insertSmartRef(
  blockType: MyElement['type'],
  blockId: string,
  columnId: string | null,
  precedingText = '',
  followingText = ''
): (MyElement | Text)[] | undefined {
  switch (blockType) {
    case ELEMENT_CODE_LINE_V2_CODE:
    case ELEMENT_CODE_LINE:
    case ELEMENT_TABLE_COLUMN_FORMULA: {
      const { textBefore, textAfter } = surroundWithPlusSigns(
        precedingText,
        followingText
      );

      const smartRef: SmartRefElement = {
        id: nanoid(),
        type: ELEMENT_SMART_REF,
        blockId,
        columnId,
        children: [{ text: '' }],
      };

      return [{ text: textBefore }, smartRef, { text: textAfter }];
    }

    // also update references in editor-language-elements / TextElements
    // or magic numbers wont be computed
    case ELEMENT_LIC:
    case ELEMENT_CALLOUT:
    case ELEMENT_BLOCKQUOTE:
    case ELEMENT_H2:
    case ELEMENT_H3:
    case ELEMENT_PARAGRAPH: {
      const magicNum: RichText = {
        text: getExprRef(blockId),
        [MARK_MAGICNUMBER]: true,
      };

      return [magicNum];
    }
    default: {
      return undefined;
    }
  }
}
