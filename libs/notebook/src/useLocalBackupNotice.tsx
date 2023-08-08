import { DocSyncEditor } from '@decipad/docsync';
import { useToast } from '@decipad/toast';
import { Button, Tooltip } from '@decipad/ui';
import { css } from '@emotion/react';
import { FC, useCallback, useEffect } from 'react';
import { useToasts } from 'react-toast-notifications';

const warningContainerStyles = css({
  whiteSpace: 'nowrap',
});

interface HasNotSavedRemotelyInAWhileWarningProps {
  onDownloadNotebook: () => void;
}

const HasNotSavedRemotelyInAWhileWarning: FC<
  HasNotSavedRemotelyInAWhileWarningProps
> = ({ onDownloadNotebook }) => {
  return (
    <div>
      <span css={warningContainerStyles}>
        We can't save to our servers.&nbsp;
        <Tooltip
          trigger={
            <span css={css({ textDecoration: 'underline' })}>
              What does this mean?
            </span>
          }
        >
          <p>
            This is likely a connection issue, and should fix itself. To be
            safe, you can download a local backup
          </p>
          <Button onClick={onDownloadNotebook}>Download notebook</Button>
        </Tooltip>
      </span>
    </div>
  );
};

const toastId = (editor: DocSyncEditor): string =>
  `${editor.id}-useLocalBackupNotice`;

export const useLocalBackupNotice = (
  editor: DocSyncEditor | undefined,
  hasNotSavedRemotelyInAWhile: boolean
) => {
  const toast = useToast();
  const { removeToast } = useToasts();

  const onDownloadNotebook = useCallback(() => {
    if (editor) {
      editor.download();
    }
  }, [editor]);

  useEffect(() => {
    if (!!editor && hasNotSavedRemotelyInAWhile) {
      toast(
        <HasNotSavedRemotelyInAWhileWarning
          onDownloadNotebook={onDownloadNotebook}
        />,
        'soft-warning',
        {
          id: toastId(editor),
          autoDismiss: false,
        }
      );
    }

    return () => {
      if (editor) {
        removeToast(toastId(editor));
      }
    };
  }, [
    editor,
    hasNotSavedRemotelyInAWhile,
    toast,
    onDownloadNotebook,
    removeToast,
  ]);
};
