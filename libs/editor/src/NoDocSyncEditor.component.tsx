import { ClientEventsContext } from '@decipad/client-events';
import {
  BlockLengthSynchronizationProvider,
  TeleportEditor,
} from '@decipad/editor-components';
import { plugins } from '@decipad/editor-config';
import type { MyValue } from '@decipad/editor-types';
import {
  ComputerContextProvider,
  EditorChangeContextProvider,
  EditorReadOnlyContext,
  useComputer,
  useEditorUserInteractionsContext,
} from '@decipad/react-contexts';
import { EditorLayout, LoadingFilter } from '@decipad/ui';
import { Plate, createPlateEditor } from '@udecode/plate';
import { FC, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { ReactEditor } from 'slate-react';
import { Tooltip } from './components';
import { emptyNotebook, introNotebook } from './exampleNotebooks';
import { POPULATE_PLAYGROUND } from './utils/storage';
import { useWriteLock } from './utils/useWriteLock';

export const NoDocSyncEditorInternal: FC = () => {
  const computer = useComputer();
  const events = useContext(ClientEventsContext);

  const interactions = useEditorUserInteractionsContext();

  const containerRef = useRef<HTMLDivElement>(null);

  const editorPlugins = useMemo(
    () =>
      plugins({
        computer,
        readOnly: false,
        events,
        interactions,
      }),
    [computer, events, interactions]
  );

  const [editor] = useState(() =>
    createPlateEditor<MyValue>({ plugins: editorPlugins })
  );

  const [changeSubject] = useState(() => new Subject<undefined>());
  const onChange = useCallback(() => {
    // Make sure all components have been updated with the new change.
    setTimeout(() => {
      changeSubject.next(undefined);
    });
  }, [changeSubject]);

  const { isWritingLocked, lockWriting } = useWriteLock(editor as ReactEditor);

  return (
    <EditorChangeContextProvider changeSubject={changeSubject}>
      <EditorReadOnlyContext.Provider
        value={{ readOnly: isWritingLocked, lockWriting }}
      >
        <LoadingFilter loading={isWritingLocked}>
          <EditorLayout ref={containerRef}>
            <BlockLengthSynchronizationProvider editor={editor}>
              <TeleportEditor editor={editor}>
                <Plate<MyValue>
                  editor={editor}
                  onChange={onChange}
                  initialValue={
                    window.localStorage.getItem(POPULATE_PLAYGROUND) === 'true'
                      ? introNotebook()
                      : emptyNotebook()
                  }
                  readOnly={isWritingLocked}
                >
                  <Tooltip />
                </Plate>
              </TeleportEditor>
            </BlockLengthSynchronizationProvider>
          </EditorLayout>
        </LoadingFilter>
      </EditorReadOnlyContext.Provider>
    </EditorChangeContextProvider>
  );
};

export const NoDocSyncEditor: FC = () => {
  return (
    <ComputerContextProvider>
      <NoDocSyncEditorInternal />
    </ComputerContextProvider>
  );
};
