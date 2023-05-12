import {
  CodeLineV2Element,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_STRUCTURED_VARNAME,
  SmartRefElement,
} from '@decipad/editor-types';

export function getStructuredCalc(
  name: string,
  value: string,
  unit?: string
): CodeLineV2Element {
  counter += 1;
  return {
    type: ELEMENT_CODE_LINE_V2,
    unit,
    id: `id-${counter}`,
    children: [
      {
        id: `id-${counter}`,
        type: ELEMENT_STRUCTURED_VARNAME,
        children: [{ text: name }],
      },
      {
        id: `id-${counter}`,
        type: ELEMENT_CODE_LINE_V2_CODE,
        children: [{ text: value }],
      },
    ],
  };
}

let counter = 0;
export function getSmartRef(
  blockId: string,
  lastSeenVariableName?: string
): SmartRefElement {
  counter += 1;
  return {
    id: `id-${counter}`,
    type: 'smart-ref',
    blockId,
    columnId: null,
    lastSeenVariableName,
    children: [{ text: '' }],
  };
}
