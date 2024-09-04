import { describe, it, expect } from 'vitest';
import type { SmartRefElement } from '@decipad/editor-types';
import { ELEMENT_PARAGRAPH, ELEMENT_SMART_REF } from '@decipad/editor-types';
import type { Computer } from '@decipad/computer-interfaces';
import type { CellInputValue } from './types';
import { parseCellText, serializeCellText } from './serializeCellText';

const computerStub = {
  getVarBlockId: (varName: string) =>
    varName.slice('exprRef_'.length).replaceAll('_', '-'),
} satisfies {
  getVarBlockId: Computer['getVarBlockId'];
} as Computer;

it('should parse a cell text containing multiple refs', () => {
  const text = '1+exprRef_aA_0+2+exprRef_bB_1+3';
  const result = parseCellText(computerStub, text);
  expect(result).toEqual([
    { text: '1+' },
    { blockId: 'aA-0' },
    { text: '+2+' },
    { blockId: 'bB-1' },
    { text: '+3' },
  ]);
});

it('should parse a cell text containing multiple lines, refs, and numbers', () => {
  const text = '1\n+\nexprRef_aA_0\n+\n2\n+\nexprRef_bB_1\n+\n3';
  const result = parseCellText(computerStub, text);
  expect(result).toEqual([
    { text: '1\n+\n' },
    { blockId: 'aA-0' },
    { text: '\n+\n2\n+\n' },
    { blockId: 'bB-1' },
    { text: '\n+\n3' },
  ]);
});

it('should return an empty text if the cell is empty', () => {
  const result = parseCellText(computerStub, '');
  expect(result).toEqual([{ text: '' }]);
});

describe('serializeCellText', () => {
  const smartRef: SmartRefElement = {
    id: 'smartRefId',
    type: ELEMENT_SMART_REF,
    blockId: 'myBlockId',
    columnId: null,
    children: [{ text: '' }],
  };

  it('should serialize a value containing a ref followed by text', () => {
    const cellValue: CellInputValue = [
      {
        id: 'paragraphId',
        type: ELEMENT_PARAGRAPH,
        children: [{ text: '1 + ' }, smartRef, { text: '+ 2' }],
      },
    ];

    const cellText = serializeCellText(cellValue);

    expect(cellText).toEqual('1 + exprRef_myBlockId + 2');
  });

  it('should serialize a value containing text followed by a ref', () => {
    const cellValue: CellInputValue = [
      {
        id: 'paragraphId',
        type: ELEMENT_PARAGRAPH,
        children: [{ text: '1 + ' }, smartRef],
      },
    ];

    const cellText = serializeCellText(cellValue);

    expect(cellText).toEqual('1 + exprRef_myBlockId');
  });

  it('should serialize a multiline value containing text followed by a ref then more text', () => {
    const cellValue: CellInputValue = [
      {
        id: 'IfDtBuF2PxxBv2hfPEvv7',
        type: 'p',
        children: [
          {
            text: '1\n+',
          },
          {
            id: 'TUBqV1zDzTymcEAfGtnMj',
            type: 'smart-ref',
            blockId: 'myBlockId',
            columnId: null,
            children: [
              {
                text: '',
              },
            ],
            lastSeenVariableName: 'Variable',
          },
          {
            text: '\n*20',
          },
        ],
      },
    ];

    const cellText = serializeCellText(cellValue);

    expect(cellText).toEqual('1\n+exprRef_myBlockId \n*20');
  });
});
