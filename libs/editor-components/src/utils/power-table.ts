import {
  ELEMENT_POWER_TABLE,
  ELEMENT_POWER_TR,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_VARIABLE_NAME,
  PowerTableElement,
} from '@decipad/editor-types';
import { requirePathBelowBlock } from '@decipad/editor-utils';
import { insertNodes, TEditor } from '@udecode/plate';
import { clone } from 'lodash';
import { nanoid } from 'nanoid';
import { Path } from 'slate';
import { GetAvailableIdentifier } from './slashCommands';

const initialPowerTableElement = {
  type: ELEMENT_POWER_TABLE,
  children: [
    {
      type: ELEMENT_TABLE_CAPTION,
      children: [
        {
          type: ELEMENT_TABLE_VARIABLE_NAME,
          children: [{ text: '' }],
        },
      ],
    },
    {
      type: ELEMENT_POWER_TR,
      children: [],
    },
  ],
} as const;

export const insertPowerTableBelow = (
  editor: TEditor,
  path: Path,
  getAvailableIdentifier: GetAvailableIdentifier
): void => {
  const table = clone(initialPowerTableElement) as unknown as PowerTableElement;
  table.id = nanoid();
  table.children[0].children[0].children[0].text = getAvailableIdentifier(
    'Power Table ',
    1
  );
  insertNodes(editor, table, {
    at: requirePathBelowBlock(editor, path),
  });
};
