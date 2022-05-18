import { useUploadDataPlugin } from '@decipad/editor-plugins';
import { EditorChangeContextProvider } from '@decipad/react-contexts';
import { EditorPlaceholder } from '@decipad/ui';
import { useCallback, useState } from 'react';
import { Plate } from '@udecode/plate';
import { MyEditor, MyValue } from '@decipad/editor-types';
import { Subject } from 'rxjs';
import * as components from './components';

export interface EditorProps {
  notebookId: string;
  loaded: boolean;
  readOnly: boolean;
  editor: MyEditor;
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

  const [changeSubject] = useState(() => new Subject<undefined>());
  const onChange = useCallback(() => {
    changeSubject.next(undefined);
  }, [changeSubject]);

  if (!loaded || !editor) {
    return <EditorPlaceholder />;
  }

  return (
    <EditorChangeContextProvider changeSubject={changeSubject}>
      <Plate<MyValue> editor={editor} onChange={onChange}>
        <InsidePlate {...props} />
      </Plate>
    </EditorChangeContextProvider>
  );
};
