import {
  ELEMENT_STRUCTURED_VARNAME,
  StructuredVarnameElement,
} from '@decipad/editor-types';
import { getNodeString, isElement, isText } from '@udecode/plate-common';
import { nanoid } from 'nanoid';
import { Normalizer } from '../element-normalizer';

export const migrateIntegration: Normalizer = ([oldIntegration, path]) => {
  if (!isElement(oldIntegration)) {
    return;
  }

  if (oldIntegration.children.length < 1) {
    return;
  }

  const [firstChild] = oldIntegration.children;

  if (isElement(firstChild) && firstChild.type === ELEMENT_STRUCTURED_VARNAME) {
    // We're all good. Migrated successfully.
    return;
  }

  const firstTextNodeIndex = oldIntegration.children.findIndex(isText);
  if (firstTextNodeIndex === -1) {
    // We don't have a text node. Something went wrong.
    return;
  }

  const firstTextNode = oldIntegration.children[firstTextNodeIndex];
  const name = getNodeString(firstTextNode);

  return [
    {
      type: 'remove_node',
      path: [...path, firstTextNodeIndex],
      node: firstTextNode,
    },
    {
      type: 'insert_node',
      path: [...path, 0],
      node: {
        type: ELEMENT_STRUCTURED_VARNAME,
        id: nanoid(),
        children: [{ text: name }],
      } satisfies StructuredVarnameElement,
    },
  ];
};
