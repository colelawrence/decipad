import {
  ComputerContextProvider,
  ResultsContext,
  useComputer,
} from '@decipad/react-contexts';
import { createPlateEditor, Plate, PlateProps } from '@udecode/plate';
import { FC, useMemo } from 'react';
import { Tooltip } from './components';
import * as configuration from './configuration';
import { emptyNotebook, introNotebook } from './exampleNotebooks';
import { POPULATE_PLAYGROUND } from './utils/storage';

const NO_DOC_SYNC_EDITOR_ID = 'nodocsynceditorid';

export const NoDocSyncEditorInternal = (props: PlateProps): ReturnType<FC> => {
  const computer = useComputer();

  const editorPlugins = useMemo(
    () => configuration.plugins(computer),
    [computer]
  );

  const editor = useMemo(
    () =>
      createPlateEditor({
        id: NO_DOC_SYNC_EDITOR_ID,
        plugins: editorPlugins,
      }),
    [editorPlugins]
  );

  return (
    <ResultsContext.Provider value={computer.results.asObservable()}>
      <Plate
        editor={editor}
        initialValue={
          window.localStorage.getItem(POPULATE_PLAYGROUND) === 'true'
            ? introNotebook()
            : emptyNotebook()
        }
        {...props}
      >
        <Tooltip />
      </Plate>
    </ResultsContext.Provider>
  );
};

export const NoDocSyncEditor = (props: PlateProps): ReturnType<FC> => {
  return (
    <ComputerContextProvider>
      <NoDocSyncEditorInternal {...props}></NoDocSyncEditorInternal>
    </ComputerContextProvider>
  );
};
