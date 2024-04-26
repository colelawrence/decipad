import type { FC } from 'react';
import {
  EditorPasteInteractionMenuProvider,
  EditorUserInteractionsProvider,
} from '@decipad/react-contexts';
import { EditorAttachmentsHandler } from '@decipad/editor-attachments';
import { NotebookLoader } from './NotebookLoader';
import { NotebookLogs } from './NotebookLogs';
import type { NotebookProps } from './types';

const inLocalDev =
  'location' in globalThis && /localhost/.test(globalThis.location.hostname);

export const Notebook: FC<NotebookProps> = ({
  getAttachmentForm,
  onAttached,
  ...rest
}) => {
  const { notebookId } = rest;

  return (
    <EditorUserInteractionsProvider>
      <EditorPasteInteractionMenuProvider>
        <EditorAttachmentsHandler
          notebookId={rest.notebookId}
          getAttachmentForm={getAttachmentForm}
          onAttached={onAttached}
        />
        <NotebookLoader key={notebookId} {...rest} />
        {!rest.readOnly && !inLocalDev && (
          <NotebookLogs notebookId={notebookId} />
        )}
      </EditorPasteInteractionMenuProvider>
    </EditorUserInteractionsProvider>
  );
};
export { NotebookProps };
