import { useUploadDataPlugin } from '@decipad/editor-plugins';
import { EditorPlaceholder } from '@decipad/ui';
import { Plate, PlateEditor } from '@udecode/plate';
import * as components from './components';

export interface EditorProps {
  notebookId: string;
  loaded: boolean;
  readOnly: boolean;
  editor: PlateEditor;
}

const InsidePlate = ({ notebookId, editor }: EditorProps) => {
  // upload / fetch data
  const {
    startUpload,
    uploadState,
    clearAll: clearAllUploads,
  } = useUploadDataPlugin({ editor });

  return (
    <>
      <components.Tooltip />
      <components.DropFile
        editor={editor}
        startUpload={startUpload}
        notebookId={notebookId}
      />
      <components.UploadDialogue
        uploadState={uploadState}
        clearAll={clearAllUploads}
      />
    </>
  );
};

export const Editor = (props: EditorProps) => {
  const { loaded, editor } = props;
  // Cursor remote presence
  // useCursors(editor);

  if (!loaded || !editor) {
    return <EditorPlaceholder />;
  }

  return (
    <Plate editor={editor}>
      <InsidePlate {...props} />
    </Plate>
  );
};
