import type { DividerElement } from '@decipad/editor-types';
import { ELEMENT_HR } from '@decipad/editor-types';
import type { DeserializeHtml } from '@udecode/plate-common';
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
