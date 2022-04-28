import { CalloutElement, ELEMENT_CALLOUT } from '@decipad/editor-types';
import { DeserializeHtml } from '@udecode/plate';
import { swatchNames, userIconKeys } from 'libs/ui/src/utils';
import { nanoid } from 'nanoid';
import { cleanString } from '../../utils/cleanString';

interface SerializableCallout {
  text: string;
  color?: string;
  icon?: string;
}

const callout = ({
  text,
  color,
  icon,
}: SerializableCallout): CalloutElement => {
  return {
    id: nanoid(),
    type: ELEMENT_CALLOUT,
    children: [{ text }],
    color,
    icon,
  };
};

export const deserializeCalloutHtml: DeserializeHtml = {
  rules: [
    {
      validNodeName: 'DIV',
      validAttribute: {
        'data-type': 'callout',
        'data-color': swatchNames,
        'data-icon': userIconKeys.map((e) => e), // typescript
      },
    },
  ],
  getNode: (el): CalloutElement | undefined => {
    return callout({
      text: cleanString(el.innerText),
      color: el.getAttribute('data-color') || undefined,
      icon: el.getAttribute('data-icon') || undefined,
    });
  },
};
