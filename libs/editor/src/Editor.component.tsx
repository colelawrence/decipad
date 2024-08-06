import { UploadFile } from '@decipad/editor-attachments';
import {
  BlockLengthSynchronizationProvider,
  TeleportEditor,
} from '@decipad/editor-components';
import type { MyEditor, MyValue } from '@decipad/editor-types';
import {
  CategoriesContextProvider,
  EditorBlockParentRefProvider,
  EditorReadOnlyContext,
} from '@decipad/react-contexts';
import { useCanUseDom, useWindowListener } from '@decipad/react-utils';
import { EditorLayout, EditorPlaceholder, LoadingFilter } from '@decipad/ui';
import { ErrorBoundary } from '@sentry/react';
import { Plate, PlateContent } from '@udecode/plate-common';
import type { FC, PropsWithChildren, ReactNode, RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { BaseEditor } from 'slate';
import { Editor as SlateEditor, Scrubber } from 'slate';
import type { ReactEditor } from 'slate-react';
import { useDebouncedCallback } from 'use-debounce';
import { CursorOverlay, RemoteAvatarOverlay, Tooltip } from './components';
import { DndPreview } from './components/DndPreview/DndPreview';
import { useAutoAnimate } from './hooks';
import { editorOnCopy } from './utils/editorOnCopy';
import { editorOnPaste } from './utils/editorOnPaste';
import { useWriteLock } from './utils/useWriteLock';
import { useComputer } from '@decipad/editor-hooks';
import { useNotebookWithIdState } from '@decipad/notebook-state';

export interface EditorProps {
  notebookId: string;
  workspaceId?: string;
  loaded: boolean;
  readOnly: boolean;
  editor?: MyEditor;
  children?: ReactNode;
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
  children,
}: EditorProps & {
  containerRef: RefObject<HTMLDivElement>;
}) => (
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

export const Editor: FC<PropsWithChildren<EditorProps>> = (props) => {
  const { editor, readOnly, workspaceId, notebookId, children } = props;

  //
  // It's important we don't run this in a useEffect.
  // Because, React will render before the useEffect can run.
  // At which point we will crash if the children make any assumptions.
  //
  // Like this, we can run normalizations on load.
  // And this component will no re-render when user is simply editing.
  //
  if (editor != null) {
    SlateEditor.normalize(editor as BaseEditor, { force: true });
  }

  //
  // Why do we need this?
  // - When you update `editor`, the component doesnt change state,
  // - because as react sees it, nothing much changed. So it will not re-render
  // - the children.
  //
  // Like this, we can tell react that it really is a new component.
  //
  const [key, setKey] = useState(0);
  useEffect(() => {
    setKey((k) => k + 1);
  }, [editor]);

  const containerRef = useRef<HTMLDivElement>(null);
  const changeSubject = useNotebookWithIdState((s) => s.editorChanges);

  const onChange = useDebouncedCallback(
    useCallback(() => {
      // Make sure all components have been updated with the new change.
      changeSubject.next(undefined);
    }, [changeSubject]),
    0
  );

  const { isWritingLocked, lockWriting } = useWriteLock(editor as ReactEditor);
  const { onRefChange } = useAutoAnimate();
  const computer = useComputer();

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
          <CategoriesContextProvider>
            <EditorLayout>
              {props.titleEditor}
              <div ref={containerRef} className="relative">
                <BlockLengthSynchronizationProvider editor={editor}>
                  <TeleportEditor editor={editor}>
                    <Plate<MyValue>
                      key={key}
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
                      <PlateContent
                        onCopy={(e) => editorOnCopy(e, editor)}
                        onPaste={(e) => editorOnPaste(e, editor, computer)}
                      />
                      <InsidePlate
                        {...props}
                        containerRef={containerRef}
                        children={children}
                      />
                      <UploadFile
                        workspaceId={workspaceId || ''}
                        notebookId={notebookId}
                      />
                    </Plate>
                  </TeleportEditor>
                </BlockLengthSynchronizationProvider>
              </div>
            </EditorLayout>
          </CategoriesContextProvider>
        </EditorBlockParentRefProvider>
      </LoadingFilter>
    </EditorReadOnlyContext.Provider>
  );
};
