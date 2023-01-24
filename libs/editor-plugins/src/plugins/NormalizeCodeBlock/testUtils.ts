import {
  DeprecatedCodeBlockElement,
  CodeLineElement,
  DEPRECATED_ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_STRUCTURED_VARNAME,
  ELEMENT_CODE_LINE_V2_CODE,
  CodeLineV2Element,
} from '@decipad/editor-types';

export function codeLine(code: string): CodeLineElement {
  return {
    type: ELEMENT_CODE_LINE,
    children: [
      {
        text: code,
      },
    ],
  } as CodeLineElement;
}

export function codeLineV2(varName: string, code: string) {
  return {
    type: ELEMENT_CODE_LINE_V2,
    children: [
      {
        type: ELEMENT_STRUCTURED_VARNAME,
        children: [{ text: varName }],
      },
      {
        type: ELEMENT_CODE_LINE_V2_CODE,
        children: [{ text: code }],
      },
    ],
  } as CodeLineV2Element;
}

export function codeBlock(
  ...codeLines: Omit<CodeLineElement, 'id'>[]
): DeprecatedCodeBlockElement {
  return {
    type: DEPRECATED_ELEMENT_CODE_BLOCK,
    children: codeLines as CodeLineElement[],
  } as DeprecatedCodeBlockElement;
}
