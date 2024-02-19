import { insertLiveConnection } from '@decipad/editor-components';
import { MyEditor, useMyEditorRef } from '@decipad/editor-types';
import { insertEmbedBelow, insertImageBelow } from '@decipad/editor-utils';
import {
  useAttachFileToNotebookMutation,
  useGetCreateAttachmentFormMutation,
} from '@decipad/graphql-client';
import { useComputer, useFileUploadStore } from '@decipad/react-contexts';
import { useToast } from '@decipad/toast';
import { Modal, UploadFileModal } from '@decipad/ui';
import { noop } from '@decipad/utils';
import { getStartPoint } from '@udecode/plate-common';
import axios, { AxiosError } from 'axios';
import { FC, useCallback } from 'react';
import { Path } from 'slate';
import { attachGenericFile } from './attachGeneric';

export const UploadFile: FC<{ notebookId: string }> = ({ notebookId }) => {
  const computer = useComputer();
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
    (editor: MyEditor, path: Path, url: string, fileName?: string) => {
      switch (fileType) {
        case 'image':
          return insertImageBelow(editor, path, url);
        case 'embed':
          return insertEmbedBelow(editor, path, url);
        case 'data':
          return insertLiveConnection({
            computer,
            editor,
            url,
            path,
            fileName,
            source: 'csv',
          });
        default:
          // not implemented yet
          return noop;
      }
    },
    [computer, fileType]
  );

  const arcEndpoint = useCallback((id: string) => `/api/pads/${id}/images`, []);

  const editor = useMyEditorRef();
  const toast = useToast();

  const insertByUrl = useCallback(
    (fileUrl: string, fileName?: string): void => {
      const { selection } = editor;
      const point =
        selection?.anchor ??
        getStartPoint(editor, [editor.children.length - 1]);
      const path = point.path.slice(0, 1);

      insertFunctionForFileType(editor, path, fileUrl, fileName);
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
        if (response.status >= 400) {
          toast.warning('There was an error uploading your file');
          return;
        }
        const url = response.data;
        insertByUrl(url, file.name);
      } catch (err) {
        console.error(err);
        let message = 'There was an error uploading your file';
        if (err instanceof AxiosError) {
          if (err.response?.status === 502) {
            message += ': File not accepted';
          }
        }
        toast(message, 'warning');
      } finally {
        setUploading(false);
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

  const [, getCreateAttachmentForm] = useGetCreateAttachmentFormMutation();
  const [, attachFileToNotebook] = useAttachFileToNotebookMutation();
  const onAttached = useCallback(
    async (handle: string) => {
      const resp = await attachFileToNotebook({ handle });
      if (resp.error) {
        throw new Error(resp.error.message);
      }
      const urlString = resp.data?.attachFileToPad?.url;
      if (!urlString) {
        return;
      }
      const url = new URL(urlString);
      return {
        url,
      };
    },
    [attachFileToNotebook]
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
        case 'data': {
          // live connection note
          if (uploadType === 'link' && typeof fileInfo === 'string') {
            insertByUrl(fileInfo);
          } else if (fileInfo instanceof File) {
            const form = async (): Promise<
              [URL, FormData, string] | undefined
            > => {
              const result = await getCreateAttachmentForm({
                notebookId,
                fileType: fileInfo.type,
                fileName: fileInfo.name,
              });
              const form2 = result.data?.getCreateAttachmentForm;
              if (!form2) {
                return;
              }
              const url = new URL(form2.url);
              const formData = new FormData();
              for (const { key, value } of form2.fields) {
                formData.set(key, value);
              }
              return [url, formData, form2.handle];
            };
            attachGenericFile(fileInfo, () => noop, form, onAttached)
              .then((response) => {
                if (!response?.url) {
                  toast(
                    'We had a server error processing your file',
                    'warning'
                  );
                  return;
                }
                insertByUrl(response.url, fileInfo.name);
              })
              .catch((err) => {
                console.error(err);
                toast('There was an error inserting data', 'warning');
              });
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
    [
      fileType,
      resetStore,
      insertByUrl,
      insertFromComputer,
      onAttached,
      getCreateAttachmentForm,
      toast,
      notebookId,
    ]
  );

  return (
    <>
      <Modal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onClose={resetStore}
      >
        <UploadFileModal
          fileType={fileType}
          onCancel={resetStore}
          onUpload={uploadFile}
          uploading={uploading}
          uploadProgress={uploadProgress}
        />
      </Modal>
    </>
  );
};
