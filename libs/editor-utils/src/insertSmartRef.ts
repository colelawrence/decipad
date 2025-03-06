import { getExprRef, parseStatement } from '@decipad/remote-computer';
import type {
  MathElement,
  MetricElement,
  MyEditor,
  MyElement,
  MyTabEditor,
  SmartRefElement,
} from '@decipad/editor-types';
import {
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_MATH,
  ELEMENT_METRIC,
  ELEMENT_PARAGRAPH,
  ELEMENT_SMART_REF,
  MARK_MAGICNUMBER,
} from '@decipad/editor-types';
import { assert, generatedNames, last } from '@decipad/utils';
import { nanoid } from 'nanoid';
import { Point } from 'slate';
import {
  getBlockAbove,
  getNodeString,
  insertText,
  isElement,
} from '@udecode/plate-common';
import { Computer } from '@decipad/computer-interfaces';
import { isFlagEnabled } from '@decipad/feature-flags';
import { convertExpressionToSmartRef as actualConvertExpressionToSmartRef } from './convertExpressionToSmartRef';
import { CODE_BLOCK_TYPES, RICH_TEXT_BLOCK_TYPES } from './block';
import { insertNodes } from './insertNodes';
import { findTextBeforeAndAfterPointInCodeLine } from './findTextBeforeAndAfterPointInCodeLine';

const magicNumberAllowedTypes = [
  ...RICH_TEXT_BLOCK_TYPES,
  ELEMENT_H2,
  ELEMENT_H3,
];

export type InsertSmartRefOptions = {
  computer: Computer;
  at: Point;
  variableName?: string;
  // For testing only
  convertExpressionToSmartRef?: typeof actualConvertExpressionToSmartRef;
} & (
  | { expression: string; blockId?: undefined }
  | { expression?: undefined; blockId: string }
);

export const insertSmartRef = (
  editor: MyEditor,
  {
    computer,
    at,
    convertExpressionToSmartRef = actualConvertExpressionToSmartRef,
    expression,
    blockId,
    variableName,
  }: InsertSmartRefOptions
) => {
  const [blockAbove, blockAbovePath] =
    getBlockAbove<MyElement>(editor, { at }) ?? [];
  if (!blockAbove || !blockAbovePath || !isElement(blockAbove)) {
    return;
  }

  // Inserting into code context
  if (CODE_BLOCK_TYPES.includes(blockAbove.type)) {
    const { textBefore: precedingText = '', textAfter: followingText = '' } =
      findTextBeforeAndAfterPointInCodeLine(blockAbove, blockAbovePath, at) ??
      {};

    const { textBefore, textAfter } = surroundWithPlusSigns(
      precedingText,
      followingText
    );

    // Insert expression as text
    if (expression) {
      insertText(editor, textBefore + expression + textAfter, { at });
      return;
    }

    // Otherwise, insert as smart ref element
    assert(!!blockId);
    const smartId = computer.getBlockIdAndColumnId$.get(blockId);
    if (!smartId) return;

    const smartRef: SmartRefElement = {
      id: nanoid(),
      type: ELEMENT_SMART_REF,
      blockId: smartId[0],
      columnId: smartId[1],
      children: [{ text: '' }],
    };

    insertNodes(editor, [{ text: textBefore }, smartRef, { text: textAfter }], {
      at,
    });

    return;
  }

  let safeBlockId = blockId;

  const getAvailableIdentifier = computer.getAvailableIdentifier.bind(computer);

  // Convert expression to block ID
  if (!safeBlockId) {
    assert(!!expression);
    assert('rootEditor' in editor);
    const tabEditor = editor as MyTabEditor;
    safeBlockId = convertExpressionToSmartRef(tabEditor.rootEditor, {
      expression,
      variableName: getAvailableIdentifier(variableName ?? generatedNames(), 1),
    });
  }

  // Inserting into empty paragraph
  if (
    blockAbove.type === ELEMENT_PARAGRAPH &&
    getNodeString(blockAbove).trim().length === 0
  ) {
    // Insert functions as math blocks
    const result = computer.getBlockIdResult$.get(blockId);
    if (result && result.result?.type.kind === 'function') {
      const math: MathElement = {
        id: nanoid(),
        type: ELEMENT_MATH,
        blockId: safeBlockId,
        children: [{ text: '' }],
      };

      insertNodes(editor, [math], { at });
      return;
    }

    // Otherwise, insert as metric block (subject to feature flag)
    if (isFlagEnabled('METRIC_BLOCK')) {
      const metric: MetricElement = {
        id: nanoid(),
        type: ELEMENT_METRIC,
        blockId: safeBlockId,
        comparisonBlockId: '',
        comparisonDescription: '',
        caption: variableName || 'Metric',
        children: [{ text: '' }],
      };

      insertNodes(editor, [metric], { at });
      return;
    }
  }

  // Inserting into non-empty rich-text
  if (magicNumberAllowedTypes.includes(blockAbove.type)) {
    insertNodes(
      editor,
      [
        {
          text: getExprRef(safeBlockId),
          [MARK_MAGICNUMBER]: true,
        },
      ],
      { at }
    );
  }
};

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
