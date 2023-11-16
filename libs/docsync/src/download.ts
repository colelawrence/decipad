import stringify from 'json-stringify-safe';
import { DocSyncEditor } from './types';
import { TNode, getNodeString } from '@udecode/plate';
import { EditorController } from '@decipad/notebook-tabs';

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

const getNotebookTitle = (document: EditorController): string =>
  getNodeString(document.TitleEditor.children[0] as TNode) || 'notebook';

export const download = (editor: DocSyncEditor) => {
  const doc = stringify(
    {
      children: editor.editorController.children,
    },
    null,
    '\t'
  );
  forceDownload(
    `${getNotebookTitle(editor.editorController)}-${
      editor.editorController.NotebookId
    }.json`,
    new Blob([doc])
  );
};
