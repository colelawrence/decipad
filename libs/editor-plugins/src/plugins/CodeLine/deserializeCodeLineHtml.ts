import {
  ELEMENT_CODE_LINE,
  CodeLineElement,
  CodeLineV2Element,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_VARNAME,
  ELEMENT_CODE_LINE_V2_CODE,
} from '@decipad/editor-types';
import { isFlagEnabled } from '@decipad/feature-flags';
import { DeserializeHtml } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { cleanString } from '../../utils/cleanString';

const codeLine = (text: string): CodeLineElement | CodeLineV2Element => {
  if (isFlagEnabled('CODE_LINE_NAME_SEPARATED')) {
    return {
      id: nanoid(),
      type: ELEMENT_CODE_LINE_V2,
      children: [
        {
          type: ELEMENT_CODE_LINE_V2_VARNAME,
          id: nanoid(),
          children: [{ text: '' }],
        },
        {
          type: ELEMENT_CODE_LINE_V2_CODE,
          id: nanoid(),
          children: [{ text }],
        },
      ],
    };
  }

  return {
    id: nanoid(),
    type: ELEMENT_CODE_LINE,
    children: [{ text }],
  };
};

export const deserializeCodeLineHtml: DeserializeHtml = {
  rules: [{ validNodeName: 'CODE' }, { validNodeName: 'OUTPUT' }],
  getNode: (el): CodeLineElement | CodeLineV2Element | undefined => {
    if (el.nodeName.toUpperCase() === 'OUTPUT') {
      return codeLine('');
    }
    return codeLine(cleanString(el.innerText));
  },
};
