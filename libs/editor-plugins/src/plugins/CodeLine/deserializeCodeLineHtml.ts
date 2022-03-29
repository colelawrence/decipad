import { ELEMENT_CODE_LINE, CodeLineElement } from '@decipad/editor-types';
import { DeserializeHtml } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { cleanString } from '../../utils/cleanString';

const codeLine = (text: string): CodeLineElement => {
  return {
    id: nanoid(),
    type: ELEMENT_CODE_LINE,
    children: [{ text }],
  };
};

export const deserializeCodeLineHtml: DeserializeHtml = {
  rules: [
    {
      validNodeName: 'CODE',
    },
    {
      validNodeName: 'OUTPUT',
    },
  ],
  getNode: (el): CodeLineElement | undefined => {
    if (el.nodeName.toUpperCase() === 'OUTPUT') {
      return codeLine('');
    }
    return codeLine(cleanString(el.innerText));
  },
};
