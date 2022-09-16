import {
  EditorBlockParentRefProvider,
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
import { useAutoAnimate } from './hooks';
import { DndPreview } from './components/DndPreview/DndPreview';

export interface EditorProps {
  notebookId: string;
  loaded: boolean;
  readOnly: boolean;
  editor: MyEditor;
}

const InsidePlate = ({
  containerRef,
}: EditorProps & {
  containerRef: RefObject<HTMLDivElement>;
}) => {
  // upload / fetch data
  return (
    <>
      <components.Tooltip />
      <components.NumberTooltip />
      <components.CursorOverlay containerRef={containerRef} />
      <DndPreview />
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

  const containerRef = useRef<HTMLDivElement>(null);
  const [changeSubject] = useState(() => new Subject<undefined>());
  const onChange = useCallback(() => {
    changeSubject.next(undefined);
  }, [changeSubject]);

  const { isWritingLocked, lockWriting } = useWriteLock(editor as ReactEditor);
  const { onRefChange } = useAutoAnimate();

  if (!loaded || !editor) {
    return <EditorPlaceholder />;
  }

  return (
    <EditorReadOnlyContext.Provider
      value={{ readOnly: readOnly || isWritingLocked, lockWriting }}
    >
      <EditorChangeContextProvider changeSubject={changeSubject}>
        <LoadingFilter loading={isWritingLocked}>
          <EditorBlockParentRefProvider onRefChange={onRefChange}>
            <div
              ref={containerRef}
              style={{ position: 'relative' }}
              data-stop-animate-query
            >
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
                disableCorePlugins={{
                  history: true,
                }}
              >
                <InsidePlate {...props} containerRef={containerRef} />
              </Plate>
            </div>
          </EditorBlockParentRefProvider>
        </LoadingFilter>
      </EditorChangeContextProvider>
    </EditorReadOnlyContext.Provider>
  );
};
