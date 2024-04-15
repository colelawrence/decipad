import {
  useRemoveFileFromNotebookMutation,
  useUndeleteFileFromNotebookMutation,
} from '@decipad/graphql-client';
import { useToast } from '@decipad/toast';
import { useCallback } from 'react';

type UseDeleteAttachment = () => {
  onDeleteAttachment: (_url: string) => void;
  onUndeleteAttachment: (_url: string) => void;
};

function getAttachmentId(url: string): string | undefined {
  return url.split('/').at(-1);
}

export const useDeleteAttachment: UseDeleteAttachment = () => {
  const [, removeAttachment] = useRemoveFileFromNotebookMutation();
  const [, undeleteFile] = useUndeleteFileFromNotebookMutation();

  const toast = useToast();

  const onDeleteAttachment = useCallback(
    (url: string) => {
      const attachmentId = getAttachmentId(url);
      if (attachmentId == null) {
        throw new Error('Could not find attachment ID');
      }

      removeAttachment({ attachmentId }).catch(() => {
        toast('Could not delete file from the notebook', 'error');
      });
    },
    [removeAttachment, toast]
  );

  const onUndeleteAttachment = useCallback(
    (url: string) => {
      const attachmentId = getAttachmentId(url);
      if (attachmentId == null) {
        throw new Error('Could not find attachment ID');
      }

      undeleteFile({ attachmentId }).catch(() => {
        toast('Could not reupload file to the notebook', 'error');
      });
    },
    [undeleteFile, toast]
  );

  return { onDeleteAttachment, onUndeleteAttachment };
};
