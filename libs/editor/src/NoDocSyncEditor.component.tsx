import {
  ComputerContextProvider,
  EditorChangeContextProvider,
  ResultsContext,
  useComputer,
} from '@decipad/react-contexts';
import { Plate } from '@udecode/plate';
import { FC, useCallback, useMemo, useState } from 'react';
import { MyPlateProps, MyValue } from '@decipad/editor-types';
import { Subject } from 'rxjs';
import { Tooltip } from './components';
import * as configuration from './configuration';
import { emptyNotebook, introNotebook } from './exampleNotebooks';
import { POPULATE_PLAYGROUND } from './utils/storage';

const NO_DOC_SYNC_EDITOR_ID = 'nodocsynceditorid';

export const NoDocSyncEditorInternal = (
  props: MyPlateProps
): ReturnType<FC> => {
  const computer = useComputer();

  const editorPlugins = useMemo(
    () => configuration.plugins(computer),
    [computer]
  );

  const [changeSubject] = useState(() => new Subject<undefined>());
  const onChange = useCallback(() => {
    changeSubject.next(undefined);
  }, [changeSubject]);

  return (
    <ResultsContext.Provider value={computer.results.asObservable()}>
      <EditorChangeContextProvider changeSubject={changeSubject}>
        <Plate<MyValue>
          id={NO_DOC_SYNC_EDITOR_ID}
          plugins={editorPlugins}
          onChange={onChange}
          initialValue={
            window.localStorage.getItem(POPULATE_PLAYGROUND) === 'true'
              ? introNotebook()
              : emptyNotebook()
          }
          {...props}
        >
          <Tooltip />
        </Plate>
      </EditorChangeContextProvider>
    </ResultsContext.Provider>
  );
};

export const NoDocSyncEditor = (props: MyPlateProps): ReturnType<FC> => {
  return (
    <ComputerContextProvider>
      <NoDocSyncEditorInternal {...props} />
    </ComputerContextProvider>
  );
};
