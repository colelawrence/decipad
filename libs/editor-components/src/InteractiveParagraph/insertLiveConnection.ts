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
import { isFlagEnabled } from '@decipad/feature-flags';
import { ExternalProvider } from '@decipad/graphql-client';
import { tryImport } from '@decipad/import';
import { generateVarName, getDefined, noop, timeout } from '@decipad/utils';
import { isCollapsed, withoutNormalizing } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { Path } from 'slate';
import { insertExternalData } from '../utils/insertExternalData';
import { needsToCreateExternalData } from '../utils/needsToCreateExternalData';

const nextBlock = (path: Path): Path => {
  const [block, ...rest] = path;
  return [block + 1, ...rest];
};

export interface InsertLiveConnectionProps {
  readonly computer: Computer;
  readonly editor: MyEditor;
  readonly source?: ImportElementSource;
  readonly fileName?: string;
  readonly url?: string;
  readonly identifyIslands?: boolean;
  readonly path?: Path;
}

/**
 * returns the ID of the live connection block or undefined if error.
 */
const justInsertLiveConnection = async ({
  editor,
  source,
  url,
  path,
  computer,
  fileName,
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
  if ((selection == null && !path) || url == null) {
    return;
  }

  const name = computer.getAvailableIdentifier(
    fileName
      ? fileName.replace(/[^A-Za-z0-9_]/g, '_').slice(0, 10)
      : generateVarName(isFlagEnabled('SILLY_NAMES'))
  );
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
        children: [{ text: name }],
      },
    ],
  };

  const insertAtPath = path || selection?.anchor.path;

  if (insertAtPath) {
    insertNodes(editor, [liveConnEl], {
      at: requirePathBelowBlock(editor, insertAtPath),
    });
  }

  return liveConnEl.id;
};

const identifyIslandsAndThenInsertLiveConnection = async ({
  computer,
  editor,
  source,
  url,
  path,
  identifyIslands,
}: InsertLiveConnectionProps): Promise<void> => {
  const { selection } = editor;

  let blockPath = path || ([selection?.anchor.path[0]] as Path);

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
        insertNodes(editor, [paragraphEl], {
          at: nextPath(),
        });
        insertNodes(editor, [liveConnEl], {
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
  const { editor, url, identifyIslands, path } = props;
  const { selection } = editor;
  if ((isCollapsed(selection) && selection?.anchor && url) || path) {
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
