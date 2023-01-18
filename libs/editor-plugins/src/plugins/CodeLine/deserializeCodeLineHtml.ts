import { CodeLineElement, CodeLineV2Element } from '@decipad/editor-types';
import { createCodeLine } from '@decipad/editor-utils';
import { DeserializeHtml } from '@udecode/plate';
import { cleanString } from '../../utils/cleanString';

export const deserializeCodeLineHtml: DeserializeHtml = {
  rules: [{ validNodeName: 'CODE' }, { validNodeName: 'OUTPUT' }],
  getNode: (el): CodeLineElement | CodeLineV2Element | undefined =>
    createCodeLine({
      code:
        el.nodeName.toUpperCase() === 'OUTPUT' ? '' : cleanString(el.innerText),
    }),
};
