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
import { Plate } from '@udecode/plate-common';
import { EditorLayout } from 'libs/ui/src/atoms';
import { ReactNode, RefObject, useCallback, useContext, useRef } from 'react';
import { ReactEditor } from 'slate-react';
import { useDebouncedCallback } from 'use-debounce';
import { EditorChangeContext } from '../../react-contexts/src/editor-change';
import { CursorOverlay, RemoteAvatarOverlay, Tooltip } from './components';
import { DndPreview } from './components/DndPreview/DndPreview';
import { useAutoAnimate } from './hooks';
import { useWriteLock } from './utils/useWriteLock';
import { Scrubber } from 'slate';

export interface EditorProps {
  notebookId: string;
  workspaceId?: string;
  loaded: boolean;
  readOnly: boolean;
  editor?: MyEditor;
  children?: ReactNode;
  tabIndex: number;
  titleEditor: JSX.Element;
}

const SCRUBBED = '[scrubbed]';

Scrubber.setScrubber((key, value) => {
  if (key.startsWith('_') || key === 'window') {
    return SCRUBBED;
  }
  if (value === globalThis) {
    return SCRUBBED;
  }
  return value;
});

const InsidePlate = ({
  containerRef,
  tabIndex,
  children,
}: EditorProps & {
  containerRef: RefObject<HTMLDivElement>;
  tabIndex: number;
}) => (
  <>
    <Tooltip />
    <ErrorBoundary fallback={<></>}>
      <CursorOverlay containerRef={containerRef} tabIndex={tabIndex} />
    </ErrorBoundary>
    <ErrorBoundary fallback={<></>}>
      <RemoteAvatarOverlay containerRef={containerRef} tabIndex={tabIndex} />
    </ErrorBoundary>
    <ErrorBoundary fallback={<></>}>
      <DndPreview />
    </ErrorBoundary>
    {children}
  </>
);

/**
 * TODO: remove Plate.id after plate patch
 */
export const Editor = (props: EditorProps) => {
  const { editor, readOnly, workspaceId, notebookId } = props;

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
          <EditorLayout>
            {props.titleEditor}
            <div ref={containerRef}>
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
                    <UploadFile notebookId={notebookId} />
                    <Integrations workspaceId={workspaceId} />
                  </Plate>
                </TeleportEditor>
              </BlockLengthSynchronizationProvider>
            </div>
          </EditorLayout>
        </EditorBlockParentRefProvider>
      </LoadingFilter>
    </EditorReadOnlyContext.Provider>
  );
};
