import { MyEditor, useTEditorRef } from '@decipad/editor-types';
import { insertImageBelow } from '@decipad/editor-utils';
import { useFileUploadStore } from '@decipad/react-contexts';
import { Dialog, UploadFileModal } from '@decipad/ui';
import { getDefined, noop } from '@decipad/utils';
import { getStartPoint } from '@udecode/plate';
import axios from 'axios';
import { FC, useCallback } from 'react';
import { Path } from 'slate';

export const UploadFile: FC = () => {
  const { dialogOpen, fileType, setDialogOpen, resetStore } =
    useFileUploadStore();

  const insertFunctionForFileType = useCallback(
    (editor: MyEditor, path: Path, url: string) => {
      switch (fileType) {
        case 'image':
          return insertImageBelow(editor, path, url);
        default:
          // not implemented yet
          return noop;
      }
    },
    [fileType]
  );

  const arcEndpoint = useCallback((id: string) => `/api/pads/${id}/images`, []);

  const editor = useTEditorRef();

  const insertByUrl = useCallback(
    (fileUrl: string): void => {
      let path;
      const selection = getDefined(editor.selection);

      if (selection == null) {
        const point = getStartPoint(editor, [editor.children.length - 1]);
        path = point.path;
      } else {
        path = selection.anchor.path.slice(0, 1);
      }

      insertFunctionForFileType(editor, path, fileUrl);
    },
    [editor, insertFunctionForFileType]
  );

  const insertFromComputer = useCallback(
    async (file: File) => {
      const targetURL = arcEndpoint(editor?.id as string);
      const response = await axios.post(targetURL, file);
      const url = response.data;

      insertByUrl(url);
    },
    [arcEndpoint, editor?.id, insertByUrl]
  );

  const uploadFile = useCallback(
    (fileInfo: any, uploadType: string) => {
      switch (fileType) {
        case 'image': {
          if (uploadType === 'embed') {
            insertByUrl(fileInfo);
          } else {
            insertFromComputer(fileInfo);
          }
          break;
        }
        default: {
          // TODO: support other file
          break;
        }
      }
      resetStore();
    },
    [fileType, insertByUrl, resetStore, insertFromComputer]
  );

  return (
    <>
      {dialogOpen && (
        <Dialog open={dialogOpen} setOpen={setDialogOpen}>
          <UploadFileModal
            fileType={fileType}
            onCancel={resetStore}
            onUpload={uploadFile}
          />
        </Dialog>
      )}
    </>
  );
};
