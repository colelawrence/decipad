import { DividerElement, ELEMENT_HR } from '@decipad/editor-types';
import { DeserializeHtml } from '@udecode/plate';
import { nanoid } from 'nanoid';

const divider = (): DividerElement => {
  return {
    id: nanoid(),
    type: ELEMENT_HR,
    children: [{ text: '' }],
  };
};

export const deserializeDividerHtml: DeserializeHtml = {
  rules: [{ validNodeName: 'HR' }],
  getNode: (): DividerElement | undefined => {
    return divider();
  },
};
