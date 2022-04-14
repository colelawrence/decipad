import { ProgramBlocksContextProvider } from '@decipad/ui';
import {
  ResultsContext,
  ComputerContextProvider,
  useComputer,
} from '@decipad/react-contexts';
import {
  Plate,
  PlateProps,
  PlateProvider,
  usePlateEditorRef,
} from '@udecode/plate';
import { FC, useMemo } from 'react';
import * as configuration from './configuration';
import { emptyNotebook, introNotebook } from './exampleNotebooks';
import { useLanguagePlugin } from './plugins';
import { Tooltip } from './components';
import { POPULATE_PLAYGROUND } from './utils/storage';
import { editorProgramBlocks } from './utils/editorProgramBlocks';

const NO_DOC_SYNC_EDITOR_ID = 'nodocsynceditorid';

export const NoDocSyncEditorBase = (props: PlateProps): ReturnType<FC> => {
  const editor = usePlateEditorRef(NO_DOC_SYNC_EDITOR_ID);
  const languagePlugin = useLanguagePlugin();
  const computer = useComputer();

  const editorPlugins = useMemo(
    () => [...configuration.plugins, languagePlugin],
    [languagePlugin]
  );

  const programBlocks = editor ? editorProgramBlocks(editor) : {};

  return (
    <ResultsContext.Provider value={computer.results.asObservable()}>
      <ProgramBlocksContextProvider value={programBlocks}>
        <Plate
          id={NO_DOC_SYNC_EDITOR_ID}
          plugins={editorPlugins}
          initialValue={
            window.localStorage.getItem(POPULATE_PLAYGROUND) === 'true'
              ? introNotebook()
              : emptyNotebook()
          }
          {...props}
        >
          <Tooltip />
        </Plate>
      </ProgramBlocksContextProvider>
    </ResultsContext.Provider>
  );
};

export const NoDocSyncEditor = (props: PlateProps): ReturnType<FC> => {
  return (
    <PlateProvider id={NO_DOC_SYNC_EDITOR_ID}>
      <ComputerContextProvider>
        <NoDocSyncEditorBase {...props} />
      </ComputerContextProvider>
    </PlateProvider>
  );
};
