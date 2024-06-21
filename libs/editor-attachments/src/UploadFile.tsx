import type { MyEditor } from '@decipad/editor-types';
import { useMyEditorRef } from '@decipad/editor-types';
import { insertEmbedBelow, insertImageBelow } from '@decipad/editor-utils';
import { useFileUploadStore } from '@decipad/react-contexts';
import { useToast } from '@decipad/toast';
import { Modal, UploadFileModal } from '@decipad/ui';
import { noop } from '@decipad/utils';
import { getStartPoint } from '@udecode/plate-common';
import axios, { AxiosError } from 'axios';
import type { FC } from 'react';
import { useCallback } from 'react';
import type { Path } from 'slate';

export const UploadFile: FC<{ notebookId: string; workspaceId: string }> = ({
  notebookId,
  workspaceId,
}) => {
  const {
    dialogOpen,
    fileType,
    setDialogOpen,
    resetStore,
    uploading,
    setUploading,
    uploadProgress,
    setUploadProgress,
  } = useFileUploadStore();

  const insertFunctionForFileType = useCallback(
    (editor: MyEditor, path: Path, url: string) => {
      switch (fileType) {
        case 'image':
          return insertImageBelow(editor, path, url, undefined, true);
        case 'embed':
          return insertEmbedBelow(editor, path, url);
        default:
          // not implemented yet
          return noop;
      }
    },
    [fileType]
  );

  const arcEndpoint = useCallback((id: string) => `/api/pads/${id}/images`, []);

  const editor = useMyEditorRef();
  const toast = useToast();

  const insertByUrl = useCallback(
    (fileUrl: string): void => {
      const { selection } = editor;
      const point =
        selection?.anchor ??
        getStartPoint(editor, [editor.children.length - 1]);
      const path = point.path.slice(0, 1);

      insertFunctionForFileType(editor, path, fileUrl);
    },
    [editor, insertFunctionForFileType]
  );

  const insertFromComputer = useCallback(
    async (file: File) => {
      const targetURL = arcEndpoint(notebookId);

      setUploading(true);
      try {
        const response = await axios.post(targetURL, file, {
          onUploadProgress(progressEvent) {
            if (!progressEvent.total) {
              return;
            }
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        });

        if (response.data.status === 429) {
          toast.warning(
            "You've reached your storage limit. Upgrade to get more."
          );
          setUploading(false);
          setUploadProgress(0);
          return;
        }

        if (response.data.status >= 400) {
          toast.warning('There was an error uploading your file');
          setUploading(false);
          setUploadProgress(0);
          return;
        }
        const url = response.data;
        setUploading(false);
        setUploadProgress(0);
        insertByUrl(url);
      } catch (err) {
        console.error(err);
        let message = 'There was an error uploading your file';
        if (err instanceof AxiosError) {
          if (err.response?.status === 502) {
            message += ': File not accepted';
          }
        }
        setUploading(false);
        setUploadProgress(0);
        toast(message, 'warning');
      }
    },
    [
      arcEndpoint,
      insertByUrl,
      notebookId,
      setUploadProgress,
      setUploading,
      toast,
    ]
  );

  const uploadFile = useCallback(
    async (fileInfo: File | string, uploadType: string) => {
      switch (fileType) {
        case 'image': {
          if (uploadType === 'link' && typeof fileInfo === 'string') {
            insertByUrl(fileInfo);
          } else if (fileInfo instanceof File) {
            await insertFromComputer(fileInfo);
          } else {
            throw new Error('This cannot happen');
          }
          break;
        }
        case 'embed': {
          if (uploadType === 'link' && typeof fileInfo === 'string') {
            insertByUrl(fileInfo);
          } else {
            throw new Error('This cannot happen');
          }
          break;
        }
        default: {
          // not implemented yet
          throw new Error('Not implemented yet');
        }
      }
      resetStore();
    },
    [fileType, resetStore, insertByUrl, insertFromComputer]
  );

  return (
    <>
      <Modal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onClose={resetStore}
        size={'md'}
        stickyToTopProps={{
          top: '15%',
          transform: 'translate(-50%, 0)',
        }}
      >
        <UploadFileModal
          workspaceId={workspaceId}
          fileType={fileType ?? 'media'}
          onCancel={resetStore}
          onUpload={uploadFile}
          uploading={uploading}
          uploadProgress={uploadProgress}
        />
      </Modal>
    </>
  );
};
