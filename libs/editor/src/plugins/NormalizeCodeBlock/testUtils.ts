import { CodeBlockElement, CodeLineElement } from '../../utils/elements';
import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
} from '../../utils/elementTypes';

export function codeLine(code: string): CodeLineElement {
  return {
    type: ELEMENT_CODE_LINE,
    children: [
      {
        text: code,
      },
    ],
  };
}

export function emptyCodeBlock(): CodeBlockElement {
  return {
    type: ELEMENT_CODE_BLOCK,
    children: [codeLine('')],
  };
}

export function exampleCodeBlock(): CodeBlockElement {
  return {
    type: ELEMENT_CODE_BLOCK,
    children: [codeLine('a = 1'), codeLine('t = {\n\n}'), codeLine('b = 2')],
  };
}
