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
import { requirePathBelowBlock } from '@decipad/editor-utils';
import { tryImport } from '@decipad/import';
import { getDefined, timeout } from '@decipad/utils';
import { insertNodes, isCollapsed, withoutNormalizing } from '@udecode/plate';
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

const justInsertLiveData = ({
  editor,
  source,
  url,
}: InsertLiveConnectionProps) => {
  const selection = getDefined(editor.selection);
  const liveConnEl: LiveConnectionElement = {
    id: nanoid(),
    type: ELEMENT_LIVE_CONNECTION,
    url: getDefined(url),
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
}: InsertLiveConnectionProps) => {
  const selection = getDefined(editor.selection);

  let blockPath = [selection.anchor.path[0]];

  const nextPath = () => {
    blockPath = nextBlock(blockPath);
    return blockPath;
  };

  const imports = await tryImport(computer, new URL(getDefined(url)), source, {
    identifyIslands,
  });

  await Promise.all(
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
  );
};

export const insertLiveConnection = async (
  props: InsertLiveConnectionProps
) => {
  const { editor, source, url } = props;
  const { selection } = editor;
  if (isCollapsed(selection) && selection?.anchor && url) {
    if (source !== 'gsheets') {
      justInsertLiveData(props);
    } else insertLiveConnectionToGsheets(props);
  }
};
