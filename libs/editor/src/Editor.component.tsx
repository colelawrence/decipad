import { TeleportEditor, NumberCatalog } from '@decipad/editor-components';
import { MyEditor, MyValue } from '@decipad/editor-types';
import { isFlagEnabled } from '@decipad/feature-flags';
import {
  EditorBlockParentRefProvider,
  EditorChangeContextProvider,
  EditorReadOnlyContext,
  useChecklist,
} from '@decipad/react-contexts';
import { useWindowListener } from '@decipad/react-utils';
import {
  EditorPlaceholder,
  LoadingFilter,
  StarterChecklist,
} from '@decipad/ui';
import { Plate } from '@udecode/plate';
import { EditorLayout } from 'libs/ui/src/atoms';
import { ReactNode, RefObject, useCallback, useRef, useState } from 'react';
import { BehaviorSubject, Subject } from 'rxjs';
import { ReactEditor } from 'slate-react';
import { Tooltip, CursorOverlay, RemoteAvatarOverlay } from './components';
import { DndPreview } from './components/DndPreview/DndPreview';
import { NotebookState } from './components/NotebookState/NotebookState';
import { useAutoAnimate } from './hooks';
import { useWriteLock } from './utils/useWriteLock';

export interface EditorProps {
  notebookId: string;
  loaded: boolean;
  isSavedRemotely: BehaviorSubject<boolean>;
  readOnly: boolean;
  editor: MyEditor;
  children?: ReactNode;
}

const InsidePlate = ({
  containerRef,
  children,
  readOnly,
}: EditorProps & {
  containerRef: RefObject<HTMLDivElement>;
}) => {
  // upload / fetch data
  return (
    <>
      <Tooltip />
      <CursorOverlay containerRef={containerRef} />
      <RemoteAvatarOverlay containerRef={containerRef} />
      {readOnly ? null : <NumberCatalog />}
      <DndPreview />
      {children}
    </>
  );
};

/**
 * TODO: remove Plate.id after plate patch
 */
export const Editor = (props: EditorProps) => {
  const { loaded, isSavedRemotely, editor, readOnly } = props;

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
  const { checklist, hideChecklist } = useChecklist();

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
              <TeleportEditor editor={editor}>
                <Plate<MyValue>
                  editor={editor}
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
                  {!checklist.hidden &&
                    !readOnly &&
                    isFlagEnabled('ONBOARDING_CHECKLIST') && (
                      <StarterChecklist
                        checklist={checklist}
                        onHideChecklist={hideChecklist}
                      />
                    )}
                  <InsidePlate {...props} containerRef={containerRef} />
                  <NotebookState isSavedRemotely={isSavedRemotely} />
                </Plate>
              </TeleportEditor>
            </EditorLayout>
          </EditorBlockParentRefProvider>
        </LoadingFilter>
      </EditorChangeContextProvider>
    </EditorReadOnlyContext.Provider>
  );
};
