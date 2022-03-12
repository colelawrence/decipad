import { Editor, ELEMENT_FETCH } from '@decipad/editor-types';
import camelcase from 'camelcase';
import { nanoid } from 'nanoid';
import { useCallback, useEffect, useState } from 'react';
import { useToasts } from 'react-toast-notifications';
import { Editor as SlateEditor, Transforms } from 'slate';
import slug from 'slug';
import * as upload from './upload';

export interface OneFileUploadState {
  file: File;
  padId: string;
  filename?: string;
  handling: boolean;
  error?: string;
  loading: boolean;
  uploading: boolean;
  uploaded: boolean;
  attaching: boolean;
  attached: boolean;
}

export type UploadState = OneFileUploadState[];

export interface UploadDataOptions {
  file: File;
  notebookId: string;
}

interface UploadDataPluginOptions {
  editor: Editor | undefined;
}

interface UseUploadDataPluginReturn {
  uploadState: UploadState;
  startUpload: (options: UploadDataOptions) => void;
  clearAll: () => void;
}

export const useUploadDataPlugin = ({
  editor,
}: UploadDataPluginOptions): UseUploadDataPluginReturn => {
  const [uploadState, setUploadState] = useState<UploadState>([]);
  const { addToast } = useToasts();

  const startUpload = useCallback(
    ({ file, notebookId }: UploadDataOptions) => {
      const newUploadState = [...uploadState].concat([
        {
          file,
          padId: notebookId,
          filename: file.name,
          handling: false,
          loading: false,
          uploading: false,
          uploaded: false,
          attaching: false,
          attached: false,
        },
      ]);
      setUploadState(newUploadState);
    },
    [uploadState, setUploadState]
  );

  const clearAll = useCallback(() => {
    setUploadState([]);
  }, [setUploadState]);

  useEffect(() => {
    (async () => {
      const needsHandling = uploadState.filter((f) => !f.handling);
      for (const file of needsHandling) {
        try {
          file.handling = true;
          file.loading = true;
          setUploadState(uploadState);

          // eslint-disable-next-line no-await-in-loop
          const form = await upload.getCreateForm({
            padId: file.padId,
            fileName: file.file.name,
            fileType: file.file.type,
          });
          file.loading = false;

          file.uploading = true;
          setUploadState(uploadState);
          // eslint-disable-next-line no-await-in-loop
          await upload.postForm(file.file, form);
          file.uploading = false;

          file.uploaded = true;
          file.attaching = true;
          setUploadState(uploadState);
          // eslint-disable-next-line no-await-in-loop
          const { url } = await upload.attachFile(form);
          file.attaching = false;

          setUploadState(uploadState);
          insertFileInDoc(editor, {
            url,
            fileName: file.file.name,
            fileType: file.file.type,
          });
        } catch (err) {
          file.error = (err as Error).message;
        }
        if (!file.error) {
          const index = uploadState.findIndex((f) => f === file);
          if (index >= 0) {
            uploadState.splice(index, 1);
          }
        }
        setUploadState(uploadState);
        addToast(`File ${file.filename} successfully uploaded`);
      }
    })();
  }, [addToast, editor, uploadState]);

  return { startUpload, uploadState, clearAll };
};

function insertFileInDoc(
  editor: Editor | undefined,
  {
    url,
    fileName,
    fileType,
  }: { url: string; fileName: string; fileType: string }
) {
  const block = {
    id: nanoid(),
    type: ELEMENT_FETCH,
    'data-varname': varNamify(fileName),
    'data-href': url,
    'data-contenttype': fileType,
    children: [
      {
        text: '', // empty text node
      },
    ],
  };
  if (editor) {
    Transforms.insertNodes(editor as unknown as SlateEditor, [block]);
    Transforms.move(editor as unknown as SlateEditor);
  }
}

function varNamify(fileName: string): string {
  return camelcase(slug(fileName), {
    pascalCase: true,
    preserveConsecutiveUppercase: true,
  });
}
