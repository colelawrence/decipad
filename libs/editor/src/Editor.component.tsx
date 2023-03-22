import {
  TeleportEditor,
  NumberCatalog,
  BlockLengthSynchronizationProvider,
} from '@decipad/editor-components';
import { MyEditor, MyValue } from '@decipad/editor-types';
import {
  EditorBlockParentRefProvider,
  EditorChangeContextProvider,
  EditorReadOnlyContext,
} from '@decipad/react-contexts';
import { useWindowListener } from '@decipad/react-utils';
import { EditorPlaceholder, LoadingFilter } from '@decipad/ui';
import { ErrorBoundary } from '@sentry/react';
import { Plate } from '@udecode/plate';
import { EditorLayout } from 'libs/ui/src/atoms';
import { ReactNode, RefObject, useCallback, useRef, useState } from 'react';
import { BehaviorSubject, Subject } from 'rxjs';
import { ReactEditor } from 'slate-react';
import { CursorOverlay, RemoteAvatarOverlay, Tooltip } from './components';
import { DndPreview } from './components/DndPreview/DndPreview';
import { NotebookState } from './components/NotebookState/NotebookState';
import { useAutoAnimate } from './hooks';
import { useUndo } from './hooks/useUndo';
import { useWriteLock } from './utils/useWriteLock';

export interface EditorProps {
  notebookId: string;
  loaded: boolean;
  isSavedRemotely: BehaviorSubject<boolean>;
  readOnly: boolean;
  editor: MyEditor;
  children?: ReactNode;
  isNewNotebook?: boolean;
}

const InsidePlate = ({
  containerRef,
  children,
  readOnly,
}: EditorProps & {
  containerRef: RefObject<HTMLDivElement>;
}) => {
  // setup undo
  useUndo();

  // upload / fetch data
  return (
    <>
      <Tooltip />
      <ErrorBoundary fallback={<></>}>
        <CursorOverlay containerRef={containerRef} />
      </ErrorBoundary>
      <ErrorBoundary fallback={<></>}>
        <RemoteAvatarOverlay containerRef={containerRef} />
      </ErrorBoundary>
      {readOnly ? null : (
        <ErrorBoundary fallback={<></>}>
          <NumberCatalog />
        </ErrorBoundary>
      )}
      <ErrorBoundary fallback={<></>}>
        <DndPreview />
      </ErrorBoundary>
      {children}
    </>
  );
};

/**
 * TODO: remove Plate.id after plate patch
 */
export const Editor = (props: EditorProps) => {
  const { loaded, isSavedRemotely, editor, readOnly, isNewNotebook } = props;

  // Cursor remote presence
  // useCursors(editor);

  const containerRef = useRef<HTMLDivElement>(null);
  const [changeSubject] = useState(() => new Subject<undefined>());
  const onChange = useCallback(() => {
    // Make sure all components have been updated with the new change.
    setTimeout(() => {
      changeSubject.next(undefined);
    });
  }, [changeSubject]);

  const { isWritingLocked, lockWriting } = useWriteLock(editor as ReactEditor);
  const { onRefChange } = useAutoAnimate();

  // When in read-mode, disallow any kind of drag & drop.
  useWindowListener(
    'dragstart',
    (e) => {
      if (readOnly) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );

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
            <EditorLayout ref={containerRef}>
              <BlockLengthSynchronizationProvider editor={editor}>
                <TeleportEditor editor={editor}>
                  <Plate<MyValue>
                    editor={editor}
                    onChange={onChange}
                    readOnly={
                      // Only respect write locks here and not the readOnly prop.
                      // Even if !readOnly, we never lock the entire editor but always keep some elements editable.
                      // The rest are controlled via EditorReadOnlyContext.
                      isWritingLocked
                    }
                    disableCorePlugins={{
                      history: true,
                    }}
                  >
                    <InsidePlate {...props} containerRef={containerRef} />
                    <NotebookState
                      isSavedRemotely={isSavedRemotely}
                      isNewNotebook={!!isNewNotebook}
                    />
                  </Plate>
                </TeleportEditor>
              </BlockLengthSynchronizationProvider>
            </EditorLayout>
          </EditorBlockParentRefProvider>
        </LoadingFilter>
      </EditorChangeContextProvider>
    </EditorReadOnlyContext.Provider>
  );
};
