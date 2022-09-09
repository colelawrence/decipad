import {
  ELEMENT_DATA_VIEW,
  ELEMENT_DATA_VIEW_TR,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_VARIABLE_NAME,
  DataViewElement,
} from '@decipad/editor-types';
import { requirePathBelowBlock } from '@decipad/editor-utils';
import { insertNodes, TEditor } from '@udecode/plate';
import { clone } from 'lodash';
import { nanoid } from 'nanoid';
import { Path } from 'slate';
import { GetAvailableIdentifier } from './slashCommands';

const getInitialDataViewElement = (
  initialTableVariableName: string | undefined
) => {
  return {
    type: ELEMENT_DATA_VIEW,
    varName: initialTableVariableName,
    children: [
      {
        type: ELEMENT_TABLE_CAPTION,
        children: [
          {
            type: ELEMENT_TABLE_VARIABLE_NAME,
            children: [{ text: `` }],
          },
        ],
      },
      {
        type: ELEMENT_DATA_VIEW_TR,
        children: [],
      },
    ],
  };
};

export const insertDataViewBelow = (
  editor: TEditor,
  path: Path,
  getAvailableIdentifier: GetAvailableIdentifier,
  initialTableVariableName?: string
): void => {
  const dataView = clone(
    getInitialDataViewElement(initialTableVariableName)
  ) as unknown as DataViewElement;
  dataView.id = nanoid();
  dataView.children[0].children[0].children[0].text = getAvailableIdentifier(
    'Data View ',
    1
  );

  insertNodes(editor, dataView, {
    at: requirePathBelowBlock(editor, path),
  });
};
