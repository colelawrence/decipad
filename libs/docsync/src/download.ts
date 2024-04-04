import stringify from 'json-stringify-safe';
import { getNodeString } from '@udecode/plate-common';
import type { MinimalRootEditor } from '@decipad/editor-types';
import { forceDownload } from '@decipad/editor-utils';

const getNotebookTitle = (editor: MinimalRootEditor): string =>
  getNodeString(editor.children[0]) || 'notebook';

export const download = (editor: MinimalRootEditor) => {
  const doc = stringify(
    {
      children: editor.children,
    },
    null,
    '\t'
  );
  forceDownload(
    `${getNotebookTitle(editor)}-${editor.id}.json`,
    new Blob([doc])
  );
};
