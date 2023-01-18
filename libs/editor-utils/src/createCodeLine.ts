import { nanoid } from 'nanoid';
import {
  CodeLineElement,
  CodeLineV2Element,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_CODE_LINE_V2_VARNAME,
} from '@decipad/editor-types';
import { isFlagEnabled } from '@decipad/feature-flags';

export interface CreateCodeLineOptions {
  /** Pass this in when it's important to have the same ID as before */
  id?: string;
  varName?: string;
  code?: string;
}

export const createCodeLine = ({
  id = nanoid(),
  varName = '',
  code = '',
}: CreateCodeLineOptions): CodeLineElement => ({
  id,
  type: ELEMENT_CODE_LINE,
  children: [{ text: varName ? `${varName} = ${code}` : code }],
});

export const createStructuredCodeLine = ({
  id = nanoid(),
  varName = '',
  code = '',
}: CreateCodeLineOptions): CodeLineElement | CodeLineV2Element => {
  if (!isFlagEnabled('CODE_LINE_NAME_SEPARATED')) {
    return createCodeLine({ id, varName, code });
  }

  return {
    id,
    type: ELEMENT_CODE_LINE_V2,
    children: [
      {
        type: ELEMENT_CODE_LINE_V2_VARNAME,
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
