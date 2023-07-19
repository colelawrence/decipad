import { UploadFile } from '@decipad/editor-attachments';
import {
  BlockLengthSynchronizationProvider,
  TeleportEditor,
} from '@decipad/editor-components';
import { Integrations } from '@decipad/editor-integrations';
import { MyEditor, MyValue } from '@decipad/editor-types';
import {
  EditorBlockParentRefProvider,
  EditorReadOnlyContext,
} from '@decipad/react-contexts';
import { useWindowListener, useCanUseDom } from '@decipad/react-utils';
import { EditorPlaceholder, LoadingFilter } from '@decipad/ui';
import { ErrorBoundary } from '@sentry/react';
import { Plate } from '@udecode/plate';
import { EditorLayout } from 'libs/ui/src/atoms';
import { ReactNode, RefObject, useCallback, useContext, useRef } from 'react';
import { BehaviorSubject } from 'rxjs';
import { ReactEditor } from 'slate-react';
import { useDebouncedCallback } from 'use-debounce';
import { EditorChangeContext } from '../../react-contexts/src/editor-change';
import { CursorOverlay, RemoteAvatarOverlay, Tooltip } from './components';
import { DndPreview } from './components/DndPreview/DndPreview';
import { NotebookState } from './components/NotebookState/NotebookState';
import { useAutoAnimate } from './hooks';
import { useUndo } from './hooks/useUndo';
import { useWriteLock } from './utils/useWriteLock';

export interface EditorProps {
  notebookId: string;
  workspaceId?: string;
  loaded: boolean;
  isSavedRemotely: BehaviorSubject<boolean>;
  readOnly: boolean;
  editor?: MyEditor;
  children?: ReactNode;
  isNewNotebook?: boolean;
}

const InsidePlate = ({
  containerRef,
  children,
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
  const { isSavedRemotely, editor, readOnly, isNewNotebook, workspaceId } =
    props;

  // Cursor remote presence
  // useCursors(editor);

  const containerRef = useRef<HTMLDivElement>(null);
  const changeSubject = useContext(EditorChangeContext);
  const onChange = useDebouncedCallback(
    useCallback(() => {
      // Make sure all components have been updated with the new change.
      changeSubject.next(undefined);
    }, [changeSubject]),
    0
  );

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

  const canUseDom = useCanUseDom();

  if (!editor) {
    return <EditorPlaceholder />;
  }
  if (canUseDom) {
    window.dispatchEvent(new Event('hashchange'));
  }

  return (
    <EditorReadOnlyContext.Provider
      value={{ readOnly: readOnly || isWritingLocked, lockWriting }}
    >
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
                  <UploadFile />
                  <Integrations workspaceId={workspaceId} />
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
    </EditorReadOnlyContext.Provider>
  );
};
