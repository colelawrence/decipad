import { getExprRef } from '@decipad/computer';
import { ELEMENT_SMART_REF, SmartRefElement } from '@decipad/editor-types';
import { RemoteComputer } from '@decipad/remote-computer';
import { isText, TText } from '@udecode/plate-common';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { nanoid } from 'nanoid';

export type CellInputValue = [
  {
    id: string;
    type: typeof ELEMENT_PARAGRAPH;
    children: CellInputInlineValue[];
  }
];

export type CellInputInlineValue = TText | SmartRefElement;

export type ParsedCellValue = (TText | { blockId: string })[];

export const serializeCellText = (value: CellInputValue): string => {
  const inlines = value[0].children;

  return inlines
    .map((inline) => {
      if (isText(inline)) return inline.text;

      if (inline.type === ELEMENT_SMART_REF)
        return `${getExprRef(inline.blockId)} `;

      throw new Error(`Unexpected inline type: ${inline.type}`);
    })
    .join('')
    .trim()
    .replace(/\s+/g, ' ');
};

export const deserializeCellText = (
  computer: RemoteComputer,
  text: string
): CellInputValue => {
  const parts = parseCellText(computer, text);

  return [
    {
      id: nanoid(),
      type: ELEMENT_PARAGRAPH,
      children: parts.map((part) => {
        if (isText(part)) return part;
        const { blockId } = part;
        return {
          id: nanoid(),
          type: ELEMENT_SMART_REF,
          blockId,
          columnId: null,
          children: [{ text: '' }],
        } satisfies SmartRefElement;
      }),
    },
  ];
};

export const parseCellText = (
  computer: RemoteComputer,
  text: string
): ParsedCellValue => {
  let remainingText = text;
  const parts: ParsedCellValue = [];

  while (remainingText.length > 0) {
    const startOfRef = remainingText.indexOf('exprRef_');

    // There are no more refs; add the remaining text
    if (startOfRef === -1) {
      parts.push({ text: remainingText });
      remainingText = '';
      continue;
    }

    // There is text before the ref; add it first
    if (startOfRef > 0) {
      parts.push({ text: remainingText.slice(0, startOfRef) });
      remainingText = remainingText.slice(startOfRef);
      continue;
    }

    const [formattedExprRef] = remainingText.match(
      /^exprRef_([a-zA-Z0-9_]*)/
    ) as [string, string];
    const blockId = computer.getVarBlockId(formattedExprRef) ?? '';
    parts.push({ blockId });
    remainingText = remainingText.slice(formattedExprRef.length);
  }

  if (parts.length === 0) return [{ text: '' }];

  return parts;
};
