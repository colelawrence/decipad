import { EditorAttachmentsHandler } from '@decipad/editor-attachments';
import { EditorStats } from '@decipad/editor-stats';
import { isFlagEnabled } from '@decipad/feature-flags';
import { EditorPasteInteractionMenuProvider } from '@decipad/react-contexts';
import { FC } from 'react';
import { EditorUserInteractionsProvider } from '../../react-contexts/src/editor-user-interactions';
import { NotebookLogs } from './NotebookLogs';
import { NotebookLoader } from './NotebookLoader';
import type { NotebookProps } from './types';

export const Notebook: FC<NotebookProps> = (props) => {
  const { getAttachmentForm, onAttached, ...rest } = props;
  const { notebookId } = rest;

  return (
    <EditorUserInteractionsProvider>
      <EditorPasteInteractionMenuProvider>
        <EditorAttachmentsHandler
          notebookId={notebookId}
          getAttachmentForm={getAttachmentForm}
          onAttached={onAttached}
        />
        <NotebookLoader key={notebookId} {...rest} />
        {!props.readOnly && isFlagEnabled('SAVE_NOTEBOOK_LOGS') && (
          <NotebookLogs notebookId={notebookId} />
        )}
        {isFlagEnabled('COMPUTER_STATS') && <EditorStats />}
      </EditorPasteInteractionMenuProvider>
    </EditorUserInteractionsProvider>
  );
};
export { NotebookProps };
