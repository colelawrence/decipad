import {
  ELEMENT_PARAGRAPH,
  ELEMENT_SMART_REF,
  SmartRefElement,
} from '@decipad/editor-types';
import { RemoteComputer } from '@decipad/remote-computer';
import {
  parseCellText,
  serializeCellText,
  CellInputValue,
} from './serializeCellText';

const computerStub = {
  getVarBlockId: (varName: string) =>
    varName.slice('exprRef_'.length).replaceAll('_', '-'),
} satisfies {
  getVarBlockId: RemoteComputer['getVarBlockId'];
} as RemoteComputer;

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

it('should return an empty text if the cell is empty', () => {
  const result = parseCellText(computerStub, '');
  expect(result).toEqual([{ text: '' }]);
});

it('should serialize a value containing a ref followed by text', () => {
  const smartRef: SmartRefElement = {
    id: 'smartRefId',
    type: ELEMENT_SMART_REF,
    blockId: 'myBlockId',
    columnId: null,
    children: [{ text: '' }],
  };

  const cellValue: CellInputValue = [
    {
      id: 'paragraphId',
      type: ELEMENT_PARAGRAPH,
      children: [{ text: '' }, smartRef, { text: 'hello' }],
    },
  ];

  const cellText = serializeCellText(cellValue);

  expect(cellText).toEqual('exprRef_myBlockId hello');
});
