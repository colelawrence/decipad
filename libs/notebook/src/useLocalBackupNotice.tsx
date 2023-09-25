import { DocSyncEditor } from '@decipad/docsync';
import { useToast } from '@decipad/toast';
import { Button, Tooltip } from '@decipad/ui';
import { css } from '@emotion/react';
import { FC, useCallback, useEffect, useMemo } from 'react';

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

export const useLocalBackupNotice = (
  editor: DocSyncEditor | undefined,
  hasNotSavedRemotelyInAWhile: boolean
) => {
  const toast = useToast();

  const onDownloadNotebook = useCallback(() => {
    if (editor) {
      editor.download();
    }
  }, [editor]);

  const toastTitle = useMemo(
    () => (
      <HasNotSavedRemotelyInAWhileWarning
        onDownloadNotebook={onDownloadNotebook}
      />
    ),
    [onDownloadNotebook]
  );

  useEffect(() => {
    let toastId: string;
    if (!!editor && hasNotSavedRemotelyInAWhile) {
      toastId = toast(toastTitle, 'soft-warning', { autoDismiss: false });
    }

    return () => {
      if (editor) {
        toast.delete(toastId);
      }
    };
  }, [
    editor,
    hasNotSavedRemotelyInAWhile,
    toast,
    onDownloadNotebook,
    toastTitle,
  ]);
};
