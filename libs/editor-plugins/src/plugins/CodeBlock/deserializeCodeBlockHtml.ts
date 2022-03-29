import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  CodeLineElement,
} from '@decipad/editor-types';
import { DeserializeHtml } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { cleanString } from '../../utils/cleanString';

const deserializeCodeLine = (el: HTMLElement): CodeLineElement | undefined => {
  if (el.tagName.toUpperCase() !== 'CODE') {
    const maybeCodeLines = Array.from(el.children).map((child) =>
      deserializeCodeLine(child as HTMLElement)
    );
    return maybeCodeLines.filter(Boolean)[0];
  }
  return {
    id: nanoid(),
    type: ELEMENT_CODE_LINE,
    children: [{ text: cleanString(el.innerText) }],
  };
};

export const deserializeCodeBlockHtml: DeserializeHtml = {
  rules: [
    {
      validNodeName: 'PRE',
    },
    {
      validNodeName: 'OUTPUT',
    },
  ],
  getNode: (el) => {
    if (el.nodeName.toUpperCase() === 'OUTPUT') {
      return;
    }

    const children = Array.from(el.children).map((child) =>
      deserializeCodeLine(child as HTMLElement)
    );
    return {
      type: ELEMENT_CODE_BLOCK,
      children,
    };
  },
};
