import { ReactEditor } from 'slate-react';
import { LoadingFilter } from '@decipad/ui';
import {
  ComputerContextProvider,
  EditorChangeContextProvider,
  EditorReadOnlyContext,
  useComputer,
} from '@decipad/react-contexts';
import { Plate, createPlateEditor } from '@udecode/plate';
import { FC, useCallback, useMemo, useState } from 'react';
import { MyValue } from '@decipad/editor-types';
import { Subject } from 'rxjs';
import { NumberTooltip, Tooltip } from './components';
import * as configuration from './configuration';
import { emptyNotebook, introNotebook } from './exampleNotebooks';
import { POPULATE_PLAYGROUND } from './utils/storage';
import { useWriteLock } from './utils/useWriteLock';

const NO_DOC_SYNC_EDITOR_ID = 'nodocsynceditorid';

export const NoDocSyncEditorInternal: FC = () => {
  const computer = useComputer();

  const editorPlugins = useMemo(
    () => configuration.plugins(computer),
    [computer]
  );

  const [editor] = useState(() =>
    createPlateEditor<MyValue>({ plugins: editorPlugins })
  );

  const [changeSubject] = useState(() => new Subject<undefined>());
  const onChange = useCallback(() => {
    changeSubject.next(undefined);
  }, [changeSubject]);

  const { isWritingLocked, lockWriting } = useWriteLock(editor as ReactEditor);

  return (
    <EditorChangeContextProvider changeSubject={changeSubject}>
      <EditorReadOnlyContext.Provider
        value={{ readOnly: isWritingLocked, lockWriting }}
      >
        <LoadingFilter loading={isWritingLocked}>
          <Plate<MyValue>
            id={NO_DOC_SYNC_EDITOR_ID}
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
            <NumberTooltip />
          </Plate>
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
