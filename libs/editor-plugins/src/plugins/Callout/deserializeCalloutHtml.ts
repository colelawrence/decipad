import { CalloutElement, ELEMENT_CALLOUT } from '@decipad/editor-types';
import { DeserializeHtml } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { cleanString } from '../../utils/cleanString';

const callout = (text: string): CalloutElement => {
  return {
    id: nanoid(),
    type: ELEMENT_CALLOUT,
    children: [{ text }],
  };
};

export const deserializeCalloutHtml: DeserializeHtml = {
  rules: [
    {
      validNodeName: 'DIV',
      validAttribute: {
        'data-type': 'callout',
      },
    },
  ],
  getNode: (el): CalloutElement | undefined => {
    return callout(cleanString(el.innerText));
  },
};
