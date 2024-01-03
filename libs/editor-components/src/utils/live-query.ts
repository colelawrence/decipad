import { RemoteComputer } from '@decipad/remote-computer';
import {
  ELEMENT_LIVE_QUERY,
  ELEMENT_LIVE_QUERY_QUERY,
  ELEMENT_LIVE_QUERY_VARIABLE_NAME,
  LiveQueryElement,
  MyEditor,
} from '@decipad/editor-types';
import { insertNodes, requirePathBelowBlock } from '@decipad/editor-utils';
import { generateVarName } from '@decipad/utils';
import { TEditor, findNode, focusEditor, nanoid } from '@udecode/plate-common';
import clone from 'lodash.clonedeep';
import { Path } from 'slate';

const getInitialLiveQueryElement = (
  blockId: string | undefined,
  varName: string | undefined
): LiveQueryElement => {
  return {
    type: ELEMENT_LIVE_QUERY,
    id: nanoid(),
    connectionBlockId: blockId,
    columnTypeCoercions: {},
    children: [
      {
        type: ELEMENT_LIVE_QUERY_VARIABLE_NAME,
        id: nanoid(),
        children: [{ text: varName ?? '' }],
      },
      {
        type: ELEMENT_LIVE_QUERY_QUERY,
        connectionBlockId: blockId,
        id: nanoid(),
        children: [{ text: 'SELECT 1 + 1 as result' }],
      },
    ],
  };
};

export const insertLiveQueryBelow = (
  editor: TEditor,
  path: Path,
  getAvailableIdentifier: RemoteComputer['getAvailableIdentifier'],
  connectionBlockId?: string,
  query?: string
): void => {
  const varName = getAvailableIdentifier(generateVarName(true));
  const liveQuery = clone(
    getInitialLiveQueryElement(connectionBlockId, varName)
  );
  if (query) {
    liveQuery.children[1].children[0].text = query;
  }

  const newPath = requirePathBelowBlock(editor, path);

  insertNodes<LiveQueryElement>(editor, [liveQuery], { at: newPath });

  setTimeout(() => {
    const findPath = [...newPath, 0];
    const node = findNode(editor, {
      at: findPath,
      block: true,
      match: (_e, p) => Path.equals(findPath, p),
    });
    if (node) {
      focusEditor(editor as MyEditor, { path: findPath, offset: 0 });
    }
  }, 0);
};
