import type { Path } from 'slate';
import cloneDeep from 'lodash.clonedeep';
import { nanoid } from 'nanoid';
import type { TEditor } from '@udecode/plate-common';
import type { Computer } from '@decipad/computer-interfaces';
import type {
  DataViewElement,
  DataViewHeaderRowElement,
} from '@decipad/editor-types';
import {
  ELEMENT_DATA_VIEW,
  ELEMENT_DATA_VIEW_TR,
  ELEMENT_DATA_VIEW_CAPTION,
  ELEMENT_DATA_VIEW_NAME,
} from '@decipad/editor-types';
import { insertNodes, requirePathBelowBlock } from '@decipad/editor-utils';

const getInitialDataViewElement = async (
  computer: Computer,
  blockId?: string,
  varName?: string
): Promise<DataViewElement> => {
  return {
    id: nanoid(),
    type: ELEMENT_DATA_VIEW,
    expandedGroups: [],
    varName: blockId,
    children: [
      {
        id: nanoid(),
        type: ELEMENT_DATA_VIEW_CAPTION,
        children: [
          {
            id: nanoid(),
            type: ELEMENT_DATA_VIEW_NAME,
            children: [
              {
                text: await computer?.getAvailableIdentifier(
                  varName ? `${varName}Data` : 'DataView'
                ),
              },
            ],
          },
        ],
      },
      {
        id: nanoid(),
        type: ELEMENT_DATA_VIEW_TR,
        children: [{ text: '' }],
      } as unknown as DataViewHeaderRowElement,
    ],
  };
};

export const insertDataViewBelow = async (
  editor: TEditor,
  path: Path,
  computer: Computer,
  blockId?: string,
  varName?: string
): Promise<void> => {
  const dataView = cloneDeep(
    await getInitialDataViewElement(computer, blockId, varName)
  );
  insertNodes(editor, [dataView], { at: requirePathBelowBlock(editor, path) });
};
