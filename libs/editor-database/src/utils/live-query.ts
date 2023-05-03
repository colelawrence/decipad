import { Computer } from '@decipad/computer';
import { insertExternalData } from '@decipad/editor-components';
import {
  ELEMENT_LIVE_QUERY,
  ELEMENT_LIVE_QUERY_QUERY,
  ELEMENT_LIVE_QUERY_VARIABLE_NAME,
  LiveQueryElement,
  MyEditor,
  ImportElementSource,
  LiveConnectionElement,
  ELEMENT_LIVE_CONNECTION,
  ELEMENT_LIVE_CONNECTION_VARIABLE_NAME,
  ParagraphElement,
} from '@decipad/editor-types';
import {
  insertNodes,
  requirePathBelowBlock,
  getURLComponents,
  getNotebook,
} from '@decipad/editor-utils';
import { ExternalProvider } from '@decipad/graphql-client';
import { tryImport } from '@decipad/import';
import { getDefined, noop, timeout } from '@decipad/utils';
import {
  findNode,
  focusEditor,
  nanoid,
  TEditor,
  isCollapsed,
  ELEMENT_PARAGRAPH,
  withoutNormalizing,
} from '@udecode/plate';
import { needsToCreateExternalData } from 'libs/editor-components/src/utils/needsToCreateExternalData';
import { clone } from 'lodash';
import { Path } from 'slate';

export interface InsertLiveConnectionProps {
  computer: Computer;
  editor: MyEditor;
  source?: ImportElementSource;
  url?: string;
  identifyIslands?: boolean;
}

const getInitialLiveQueryElement = (
  blockId: string | undefined,
  varName: string | undefined
): LiveQueryElement => ({
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
      id: nanoid(),
      children: [{ text: 'SELECT 1 + 1 as result' }],
    },
  ],
});

export const insertLiveQueryBelow = (
  editor: TEditor,
  path: Path,
  getAvailableIdentifier: Computer['getAvailableIdentifier'],
  connectionBlockId?: string,
  query?: string
): void => {
  const varName = getAvailableIdentifier('LiveQuery', 1);
  const liveQuery = clone(
    getInitialLiveQueryElement(connectionBlockId, varName)
  );
  if (query) {
    liveQuery.children[1].children[0].text = query;
  }

  const newPath = requirePathBelowBlock(editor, path);

  insertNodes<LiveQueryElement>(editor, liveQuery, { at: newPath });

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

const justInsertLiveConnection = async ({
  editor,
  source,
  url,
}: InsertLiveConnectionProps): Promise<string | undefined> => {
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
  return liveConnEl.id;
};

const identifyIslandsAndThenInsertLiveConnection = async ({
  computer,
  editor,
  source,
  url,
  identifyIslands,
}: InsertLiveConnectionProps): Promise<void> => {
  const selection = getDefined(editor.selection);

  let blockPath = [selection.anchor.path[0]];

  const nextBlock = (path: Path): Path => {
    const [block, ...rest] = path;
    return [block + 1, ...rest];
  };

  const nextPath = () => {
    blockPath = nextBlock(blockPath);
    return blockPath;
  };

  if (!url) {
    return;
  }

  const imports = await tryImport(
    {
      computer,
      url: new URL(url),
      provider: source,
    },
    {
      identifyIslands,
    }
  );

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

/**
 * Returns the ID of the live connection or undefined.
 */
export const insertLiveConnection = async (
  props: InsertLiveConnectionProps
): Promise<string | undefined> => {
  const { editor, url, identifyIslands } = props;
  const { selection } = editor;
  if (isCollapsed(selection) && selection?.anchor && url) {
    if (identifyIslands) {
      await identifyIslandsAndThenInsertLiveConnection(props);
      return;
    }
    if (needsToCreateExternalData(props)) {
      const externalData = await insertExternalData({
        name: `data-source/${props.editor.id}/${props.source}/${props.url}`,
        padId: props.editor.id,
        externalId: props.url ?? '',
        provider: getDefined(props.source) as ExternalProvider,
      });
      return justInsertLiveConnection({
        ...props,
        url: getDefined(externalData.dataUrl),
      });
    }
    return justInsertLiveConnection(props);
  }
  return undefined;
};
