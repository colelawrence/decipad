import { nanoid } from 'nanoid';
import {
  CodeLineElement,
  CodeLineV2Element,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_STRUCTURED_VARNAME,
} from '@decipad/editor-types';

export interface CreateCodeLineOptions {
  /** Pass this in when it's important to have the same ID as before */
  id?: string;
  varName?: string;
  code?: string;
}

export const createCodeLine = ({
  id,
  varName = '',
  code = '',
}: CreateCodeLineOptions): CodeLineElement => ({
  id: id ?? nanoid(),
  type: ELEMENT_CODE_LINE,
  children: [{ text: varName ? `${varName} = ${code}` : code }],
});

export const createStructuredCodeLine = ({
  id,
  varName = '',
  code = '',
}: CreateCodeLineOptions): CodeLineElement | CodeLineV2Element => {
  return {
    id: id ?? nanoid(),
    type: ELEMENT_CODE_LINE_V2,
    children: [
      {
        type: ELEMENT_STRUCTURED_VARNAME,
        id: nanoid(),
        children: [{ text: varName }],
      },
      {
        type: ELEMENT_CODE_LINE_V2_CODE,
        id: nanoid(),
        children: [{ text: code }],
      },
    ],
  };
};
