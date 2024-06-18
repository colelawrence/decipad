import type { LiveQueryElement, MyEditor } from '@decipad/editor-types';
import {
  ELEMENT_LIVE_QUERY,
  ELEMENT_LIVE_QUERY_QUERY,
  ELEMENT_LIVE_QUERY_VARIABLE_NAME,
} from '@decipad/editor-types';
import type { GetAvailableIdentifier } from '@decipad/editor-utils';
import {
  insertNodes,
  requirePathBelowBlock,
  generateVarName,
} from '@decipad/editor-utils';
import type { TEditor } from '@udecode/plate-common';
import { findNode, focusEditor, nanoid } from '@udecode/plate-common';
import clone from 'lodash/cloneDeep';
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

export const insertLiveQueryBelow = async (
  editor: TEditor,
  path: Path,
  getAvailableIdentifier: GetAvailableIdentifier,
  connectionBlockId?: string,
  query?: string
): Promise<void> => {
  const varName = await getAvailableIdentifier(generateVarName());
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
