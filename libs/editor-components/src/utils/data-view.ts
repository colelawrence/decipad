import type { DataViewElement } from '@decipad/editor-types';
import {
  ELEMENT_DATA_VIEW,
  ELEMENT_DATA_VIEW_TR,
  ELEMENT_DATA_VIEW_CAPTION,
  ELEMENT_DATA_VIEW_NAME,
} from '@decipad/editor-types';
import { insertNodes, requirePathBelowBlock } from '@decipad/editor-utils';
import type { TEditor } from '@udecode/plate-common';
import cloneDeep from 'lodash.clonedeep';
import { nanoid } from 'nanoid';
import type { Path } from 'slate';
import type { RemoteComputer } from '@decipad/remote-computer';

const getInitialDataViewElement = (
  computer: RemoteComputer,
  blockId?: string,
  varName?: string
): DataViewElement => {
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
                text: computer?.getAvailableIdentifier(
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
        children: [],
      },
    ],
  };
};

export const insertDataViewBelow = (
  editor: TEditor,
  path: Path,
  computer: RemoteComputer,
  blockId?: string,
  varName?: string
): void => {
  const dataView = cloneDeep(
    getInitialDataViewElement(computer, blockId, varName)
  );
  insertNodes(editor, [dataView], { at: requirePathBelowBlock(editor, path) });
};
