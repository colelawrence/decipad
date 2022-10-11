import {
  EditorBlockParentRefProvider,
  EditorChangeContextProvider,
  EditorReadOnlyContext,
  useChecklist,
} from '@decipad/react-contexts';
import {
  EditorPlaceholder,
  LoadingFilter,
  StarterChecklist,
} from '@decipad/ui';
import { ReactNode, RefObject, useCallback, useRef, useState } from 'react';
import { Plate } from '@udecode/plate';
import { MyEditor, MyValue } from '@decipad/editor-types';
import { Subject } from 'rxjs';
import { ReactEditor } from 'slate-react';
import { isFlagEnabled } from '@decipad/feature-flags';
import { EditorLayout } from 'libs/ui/src/atoms';
import * as components from './components';
import { useWriteLock } from './utils/useWriteLock';
import { useAutoAnimate } from './hooks';
import { DndPreview } from './components/DndPreview/DndPreview';

export interface EditorProps {
  notebookId: string;
  loaded: boolean;
  readOnly: boolean;
  editor: MyEditor;
  children?: ReactNode;
}

const InsidePlate = ({
  containerRef,
  children,
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
      {children}
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
    // Make sure all components have been updated with the new change.
    setTimeout(() => {
      changeSubject.next(undefined);
    });
  }, [changeSubject]);

  const { isWritingLocked, lockWriting } = useWriteLock(editor as ReactEditor);
  const { onRefChange } = useAutoAnimate();
  const { checklist, hideChecklist } = useChecklist();

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
              </Plate>
            </EditorLayout>
          </EditorBlockParentRefProvider>
        </LoadingFilter>
      </EditorChangeContextProvider>
    </EditorReadOnlyContext.Provider>
  );
};
