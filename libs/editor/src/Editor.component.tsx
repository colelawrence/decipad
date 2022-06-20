import { useUploadDataPlugin } from '@decipad/editor-plugins';
import { EditorChangeContextProvider } from '@decipad/react-contexts';
import { EditorPlaceholder } from '@decipad/ui';
import { RefObject, useCallback, useRef, useState } from 'react';
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

const InsidePlate = ({
  notebookId,
  editor,
  containerRef,
}: EditorProps & {
  containerRef: RefObject<HTMLDivElement>;
}) => {
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
      <components.CursorOverlay containerRef={containerRef} />
    </>
  );
};

/**
 * TODO: remove Plate.id after plate patch
 */
export const Editor = (props: EditorProps) => {
  const { loaded, editor } = props;
  // Cursor remote presence
  // useCursors(editor);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [changeSubject] = useState(() => new Subject<undefined>());
  const onChange = useCallback(() => {
    changeSubject.next(undefined);
  }, [changeSubject]);

  if (!loaded || !editor) {
    return <EditorPlaceholder />;
  }

  return (
    <EditorChangeContextProvider changeSubject={changeSubject}>
      <div ref={containerRef} style={{ position: 'relative' }}>
        <Plate<MyValue> editor={editor} id={editor.id} onChange={onChange}>
          <InsidePlate {...props} containerRef={containerRef} />
        </Plate>
      </div>
    </EditorChangeContextProvider>
  );
};
