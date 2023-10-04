import stringify from 'json-stringify-safe';
import { DocSyncEditor } from './types';
import { Document } from '@decipad/editor-types';
import { getNodeString } from '@udecode/plate';

const forceDownload = (fileName: string, file: Blob) => {
  // Create blob link to download
  const url = window.URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);

  // Append to html link element page
  document.body.appendChild(link);

  // Start download
  link.click();

  // Clean up and remove the link
  link.parentNode?.removeChild(link);
};

const getNotebookTitle = (document: Document): string =>
  getNodeString(document?.children[0]) || 'notebook';

export const download = (editor: DocSyncEditor) => {
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
