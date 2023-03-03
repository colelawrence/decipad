import { Computer } from '@decipad/computer';
import {
  ELEMENT_LIVE_CONNECTION,
  ELEMENT_LIVE_CONNECTION_VARIABLE_NAME,
  ELEMENT_PARAGRAPH,
  ImportElementSource,
  LiveConnectionElement,
  MyEditor,
  ParagraphElement,
} from '@decipad/editor-types';
import {
  getNotebook,
  getURLComponents,
  insertNodes,
  requirePathBelowBlock,
} from '@decipad/editor-utils';
import { tryImport } from '@decipad/import';
import { getDefined, noop, timeout } from '@decipad/utils';
import { isCollapsed, withoutNormalizing } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { Path } from 'slate';

const nextBlock = (path: Path): Path => {
  const [block, ...rest] = path;
  return [block + 1, ...rest];
};

export interface InsertLiveConnectionProps {
  computer: Computer;
  editor: MyEditor;
  source?: ImportElementSource;
  url?: string;
  identifyIslands?: boolean;
}

const justInsertLiveData = async ({
  editor,
  source,
  url,
}: InsertLiveConnectionProps) => {
  if (source === 'decipad' && url) {
    const { docId } = getURLComponents(url);
    const { hasAccess, exists, isPublic } = await getNotebook(docId);
    const error = !exists
      ? 'Notebook does not exist'
      : !hasAccess
      ? "You don't have access to this notebook"
      : !isPublic
      ? 'You can only create live connections to public notebooks'
      : undefined;
    if (error) {
      throw new Error(error);
    }
  }
  const { selection } = editor;
  if (selection == null || url == null) {
    return;
  }
  const liveConnEl: LiveConnectionElement = {
    id: nanoid(),
    type: ELEMENT_LIVE_CONNECTION,
    url,
    source,
    isFirstRowHeaderRow: false,
    columnTypeCoercions: [],
    children: [
      {
        id: nanoid(),
        type: ELEMENT_LIVE_CONNECTION_VARIABLE_NAME,
        children: [{ text: '' }],
      },
    ],
  };
  insertNodes(editor, liveConnEl, {
    at: requirePathBelowBlock(editor, selection.anchor.path),
  });
};

const insertLiveConnectionToGsheets = async ({
  computer,
  editor,
  source,
  url,
  identifyIslands,
}: InsertLiveConnectionProps): Promise<void> => {
  const selection = getDefined(editor.selection);

  let blockPath = [selection.anchor.path[0]];

  const nextPath = () => {
    blockPath = nextBlock(blockPath);
    return blockPath;
  };

  if (!url) {
    return;
  }

  const imports = await tryImport(computer, new URL(url), source, {
    identifyIslands,
  });

  return Promise.all(
    imports.map(async (imp) => {
      const liveConnEl: LiveConnectionElement = {
        id: nanoid(),
        type: ELEMENT_LIVE_CONNECTION,
        url: imp.meta?.sourceUrl?.toString() ?? getDefined(url),
        source,
        isFirstRowHeaderRow: false,
        columnTypeCoercions: [],
        children: [
          {
            id: nanoid(),
            type: ELEMENT_LIVE_CONNECTION_VARIABLE_NAME,
            children: [{ text: '' }],
          },
        ],
      };
      const paragraphEl: ParagraphElement = {
        id: nanoid(),
        type: ELEMENT_PARAGRAPH,
        children: [{ text: 'Add your explanation here', italic: true }],
      };
      withoutNormalizing(editor, () => {
        insertNodes(editor, paragraphEl, {
          at: nextPath(),
        });
        insertNodes(editor, liveConnEl, {
          at: nextPath(),
        });
      });

      await timeout(2000);
    })
  ).then(noop);
};

export const insertLiveConnection = async (
  props: InsertLiveConnectionProps
): Promise<void> => {
  const { editor, source, url } = props;
  const { selection } = editor;
  if (isCollapsed(selection) && selection?.anchor && url) {
    if (source !== 'gsheets') {
      return justInsertLiveData(props);
    }
    return insertLiveConnectionToGsheets(props);
  }
};
