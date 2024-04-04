import type { FC } from 'react';
import { useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactEditor } from 'slate-react';
import { Subject } from 'rxjs';
import { Plate, PlateContent } from '@udecode/plate-common';
import { EditorLayout, LoadingFilter } from '@decipad/ui';
import {
  ComputerContextProvider,
  EditorChangeContextProvider,
  EditorReadOnlyContext,
  useComputer,
  useEditorUserInteractionsContext,
} from '@decipad/react-contexts';
import type { MyValue } from '@decipad/editor-types';
import { createMyPlateEditor } from '@decipad/editor-types';
import {
  BlockLengthSynchronizationProvider,
  TeleportEditor,
} from '@decipad/editor-components';
import { ClientEventsContext } from '@decipad/client-events';
import { plugins } from '@decipad/editor-config';
import { Tooltip } from './components';
import { embedNotebook } from './exampleNotebooks';
import { useWriteLock } from './utils/useWriteLock';

export const NoDocSyncEmbedInternal: FC = () => {
  const computer = useComputer();
  const events = useContext(ClientEventsContext);

  const interactions = useEditorUserInteractionsContext();

  const containerRef = useRef<HTMLDivElement>(null);

  const editorPlugins = useMemo(
    () =>
      plugins({
        computer,
        readOnly: true,
        events,
        interactions,
      }),
    [computer, events, interactions]
  );

  const [editor] = useState(() =>
    createMyPlateEditor({ plugins: editorPlugins })
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
      <EditorReadOnlyContext.Provider value={{ readOnly: true, lockWriting }}>
        <LoadingFilter loading={isWritingLocked}>
          <EditorLayout ref={containerRef}>
            <BlockLengthSynchronizationProvider editor={editor}>
              <TeleportEditor editor={editor}>
                <Plate<MyValue>
                  editor={editor}
                  onChange={onChange}
                  initialValue={embedNotebook()}
                  readOnly={true}
                >
                  <PlateContent />
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

export const NoDocSyncEmbed: FC = () => {
  return (
    <ComputerContextProvider>
      <NoDocSyncEmbedInternal />
    </ComputerContextProvider>
  );
};
