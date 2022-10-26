import { ReactEditor } from 'slate-react';
import { EditorLayout, LoadingFilter } from '@decipad/ui';
import {
  ComputerContextProvider,
  EditorChangeContextProvider,
  EditorReadOnlyContext,
  useComputer,
  useEditorUserInteractionsContext,
} from '@decipad/react-contexts';
import { Plate, createPlateEditor } from '@udecode/plate';
import { FC, useCallback, useContext, useMemo, useState, useRef } from 'react';
import { MyValue } from '@decipad/editor-types';
import { ClientEventsContext } from '@decipad/client-events';
import { Subject } from 'rxjs';
import { Tooltip } from './components';
import * as configuration from './configuration';
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
      configuration.plugins({
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
            <Plate<MyValue>
              editor={editor}
              onChange={onChange}
              initialValue={
                window.localStorage.getItem(POPULATE_PLAYGROUND) === 'true'
                  ? introNotebook()
                  : emptyNotebook()
              }
              editableProps={{
                readOnly: isWritingLocked,
              }}
            >
              <Tooltip />
            </Plate>
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
