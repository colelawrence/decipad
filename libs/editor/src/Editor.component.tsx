import { useUploadDataPlugin } from '@decipad/editor-plugins';
import {
  EditorChangeContextProvider,
  EditorReadOnlyContext,
} from '@decipad/react-contexts';
import { EditorPlaceholder, LoadingFilter } from '@decipad/ui';
import { RefObject, useCallback, useRef, useState } from 'react';
import { Plate } from '@udecode/plate';
import { MyEditor, MyValue } from '@decipad/editor-types';
import { Subject } from 'rxjs';
import { ReactEditor } from 'slate-react';
import * as components from './components';
import { useWriteLock } from './utils/useWriteLock';

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
  const { loaded, editor, readOnly } = props;

  // Cursor remote presence
  // useCursors(editor);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [changeSubject] = useState(() => new Subject<undefined>());
  const onChange = useCallback(() => {
    changeSubject.next(undefined);
  }, [changeSubject]);

  const { isWritingLocked, lockWriting } = useWriteLock(editor as ReactEditor);

  if (!loaded || !editor) {
    return <EditorPlaceholder />;
  }

  return (
    <EditorReadOnlyContext.Provider
      value={{ readOnly: readOnly || isWritingLocked, lockWriting }}
    >
      <EditorChangeContextProvider changeSubject={changeSubject}>
        <LoadingFilter loading={isWritingLocked}>
          <div ref={containerRef} style={{ position: 'relative' }}>
            <Plate<MyValue>
              editor={editor}
              id={editor.id}
              onChange={onChange}
              editableProps={{
                // Only respect write locks here and not the readOnly prop.
                // Even if !readOnly, we never lock the entire editor but always keep some elements editable.
                // The rest are controlled via EditorReadOnlyContext.
                readOnly: isWritingLocked,
              }}
            >
              <InsidePlate {...props} containerRef={containerRef} />
            </Plate>
          </div>
        </LoadingFilter>
      </EditorChangeContextProvider>
    </EditorReadOnlyContext.Provider>
  );
};
