import { ClientEventsContext } from '@decipad/client-events';
import {
  BlockLengthSynchronizationProvider,
  TeleportEditor,
} from '@decipad/editor-components';
import { plugins } from '@decipad/editor-config';
import type { MyValue } from '@decipad/editor-types';
import { createMyPlateEditor } from '@decipad/editor-types';
import {
  EditorIdContext,
  EditorReadOnlyContext,
  useEditorUserInteractionsContext,
} from '@decipad/react-contexts';
import { EditorLayout, LoadingFilter } from '@decipad/ui';
import { Plate, PlateContent } from '@udecode/plate-common';
import type { FC } from 'react';
import { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import type { ReactEditor } from 'slate-react';
import { withReact } from 'slate-react';
import { Tooltip } from './components';
import {
  emptyNotebook,
  introNotebook,
  introNotebookTitle,
} from './exampleNotebooks';
import { POPULATE_PLAYGROUND } from './utils/storage';
import { useWriteLock } from './utils/useWriteLock';
import { createEditor } from 'slate';
import { TitleEditor } from './TitleEditor.component';
import { createUpdateComputerPlugin } from 'libs/editor-plugins/src/plugins/UpdateComputer/createUpdateComputerPlugin';
import { useComputer } from '@decipad/editor-hooks';

export const NoDocSyncEditorInternal: FC = () => {
  const computer = useComputer();
  const events = useContext(ClientEventsContext);

  const interactions = useEditorUserInteractionsContext();

  const containerRef = useRef<HTMLDivElement>(null);

  const editorPlugins = useMemo(
    () => [
      ...plugins({
        computer,
        events,
        interactions,
      }),
      createUpdateComputerPlugin(computer),
    ],
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

  const [titleEditor] = useState(() => {
    const e = withReact(createEditor());
    const { apply } = e;
    e.apply = (op) => {
      if (
        op.type === 'set_selection' ||
        op.type === 'insert_text' ||
        op.type === 'remove_text'
      ) {
        apply(op);
      }
    };

    return e;
  });

  const populateNotebook =
    window.localStorage.getItem(POPULATE_PLAYGROUND) === 'true';

  return (
    <EditorIdContext.Provider value={editor.id}>
      <EditorReadOnlyContext.Provider
        value={{ readOnly: isWritingLocked, lockWriting }}
      >
        <LoadingFilter loading={isWritingLocked}>
          <EditorLayout>
            <TitleEditor
              tab={undefined}
              editor={titleEditor}
              initialValue={[
                {
                  type: 'title',
                  children: [
                    { text: populateNotebook ? introNotebookTitle : '' },
                  ],
                } as any,
              ]}
              readOnly={isWritingLocked}
              onUndo={() => {}}
              onRedo={() => {}}
            />
            <div ref={containerRef}>
              <BlockLengthSynchronizationProvider editor={editor}>
                <TeleportEditor editor={editor}>
                  <Plate<MyValue>
                    editor={editor}
                    onChange={onChange}
                    initialValue={
                      populateNotebook ? introNotebook() : emptyNotebook()
                    }
                    readOnly={isWritingLocked}
                  >
                    <PlateContent />
                    <Tooltip />
                  </Plate>
                </TeleportEditor>
              </BlockLengthSynchronizationProvider>
            </div>
          </EditorLayout>
        </LoadingFilter>
      </EditorReadOnlyContext.Provider>
    </EditorIdContext.Provider>
  );
};

export const NoDocSyncEditor: FC = () => {
  return <NoDocSyncEditorInternal />;
};
