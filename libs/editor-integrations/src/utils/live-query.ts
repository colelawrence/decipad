import { Computer } from '@decipad/computer';
import { insertExternalData } from '@decipad/editor-components';
import {
  ELEMENT_LIVE_QUERY_QUERY,
  ELEMENT_LIVE_QUERY_VARIABLE_NAME,
  MyEditor,
  ImportElementSource,
  LiveDataSetElement,
  ELEMENT_LIVE_DATASET,
  ELEMENT_LIVE_DATASET_VARIABLE_NAME,
  ELEMENT_LIVE_QUERY,
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
  nanoid,
  isCollapsed,
  withoutNormalizing,
  TEditor,
  getChildren,
  insertText,
} from '@udecode/plate';
import { needsToCreateExternalData } from 'libs/editor-components/src/utils/needsToCreateExternalData';
import { Path } from 'slate';

export interface InsertLiveDataSetProps {
  computer: Computer;
  editor: MyEditor;
  source?: ImportElementSource;
  url?: string;
  identifyIslands?: boolean;
  connectionName?: string;
}

export const addQueryToLiveDataSet = (
  editor: TEditor,
  connectionBlockId?: string,
  query?: string
): void => {
  const liveQuery = findNode(editor, {
    at: [],
    match: { connectionBlockId },
  });

  if (liveQuery && query) {
    const [, path] = getChildren(liveQuery);

    insertText(editor, query, { at: path[1] });
  }
};

const justInsertLiveDataSet = async ({
  editor,
  source,
  url,
  connectionName,
  computer,
}: InsertLiveDataSetProps): Promise<string | undefined> => {
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
  const blockId = nanoid();
  const availableIdentifier = computer.getAvailableIdentifier(
    connectionName || 'LiveConnection',
    1
  );
  const liveConnEl: LiveDataSetElement = {
    id: blockId,
    type: ELEMENT_LIVE_DATASET,
    url,
    source,
    isFirstRowHeaderRow: false,
    columnTypeCoercions: [],
    hideLiveQueryResults: true,
    children: [
      {
        id: nanoid(),
        type: ELEMENT_LIVE_DATASET_VARIABLE_NAME,
        children: [{ text: availableIdentifier }],
      },
      {
        type: ELEMENT_LIVE_QUERY,
        id: nanoid(),
        connectionBlockId: blockId,
        columnTypeCoercions: {},
        children: [
          {
            type: ELEMENT_LIVE_QUERY_VARIABLE_NAME,
            id: nanoid(),
            children: [{ text: '' }],
            isHidden: true,
          },
          {
            type: ELEMENT_LIVE_QUERY_QUERY,
            connectionBlockId: blockId,
            id: nanoid(),
            children: [{ text: 'SELECT 1 + 1 as result' }],
            isHidden: true,
          },
        ],
      },
    ],
  };
  insertNodes(editor, liveConnEl, {
    at: requirePathBelowBlock(editor, selection.anchor.path),
  });
  return liveConnEl.id;
};

const identifyIslandsAndThenInsertLiveDataSet = async ({
  computer,
  editor,
  source,
  url,
  identifyIslands,
  connectionName,
}: InsertLiveDataSetProps): Promise<void> => {
  const selection = getDefined(editor.selection);
  const availableIdentifier = computer.getAvailableIdentifier(
    connectionName || 'LiveConnection',
    1
  );

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
      const blockId = nanoid();
      const liveConnEl: LiveDataSetElement = {
        id: blockId,
        type: ELEMENT_LIVE_DATASET,
        url: imp.meta?.sourceUrl?.toString() ?? getDefined(url),
        source,
        isFirstRowHeaderRow: false,
        columnTypeCoercions: [],
        children: [
          {
            id: nanoid(),
            type: ELEMENT_LIVE_DATASET_VARIABLE_NAME,
            children: [{ text: availableIdentifier }],
          },
          {
            type: ELEMENT_LIVE_QUERY,
            id: nanoid(),
            connectionBlockId: blockId,
            hideLiveQueryResults: true,
            columnTypeCoercions: {},
            children: [
              {
                type: ELEMENT_LIVE_QUERY_VARIABLE_NAME,
                id: nanoid(),
                children: [{ text: '' }],
              },
              {
                type: ELEMENT_LIVE_QUERY_QUERY,
                connectionBlockId: blockId,
                id: nanoid(),
                children: [{ text: 'SELECT 1 + 1 as result' }],
              },
            ],
          },
        ],
      };
      withoutNormalizing(editor, () => {
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
export const insertLiveDataSet = async (
  props: InsertLiveDataSetProps
): Promise<string | undefined> => {
  const { editor, url, identifyIslands } = props;
  const { selection } = editor;
  if (isCollapsed(selection) && selection?.anchor && url) {
    if (identifyIslands) {
      await identifyIslandsAndThenInsertLiveDataSet(props);
      return;
    }
    if (needsToCreateExternalData(props)) {
      const externalData = await insertExternalData({
        name: `data-source/${props.editor.id}/${props.source}/${props.url}`,
        padId: props.editor.id,
        externalId: props.url ?? '',
        provider: getDefined(props.source) as ExternalProvider,
      });
      return justInsertLiveDataSet({
        ...props,
        url: getDefined(externalData.dataUrl),
      });
    }
    return justInsertLiveDataSet(props);
  }
  return undefined;
};
