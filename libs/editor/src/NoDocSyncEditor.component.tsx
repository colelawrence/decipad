import {
  ResultsContext,
  ComputerContextProvider,
  useComputer,
} from '@decipad/react-contexts';
import { Plate, PlateProps } from '@udecode/plate';
import { FC, useMemo } from 'react';
import * as configuration from './configuration';
import { emptyNotebook, introNotebook } from './exampleNotebooks';
import { useLanguagePlugin } from './plugins';
import { Tooltip } from './components';
import { POPULATE_PLAYGROUND } from './utils/storage';

const NO_DOC_SYNC_EDITOR_ID = 'nodocsynceditorid';

export const NoDocSyncEditor = (props: PlateProps): ReturnType<FC> => {
  const languagePlugin = useLanguagePlugin();
  const computer = useComputer();

  const editorPlugins = useMemo(
    () => [...configuration.plugins, languagePlugin],
    [languagePlugin]
  );

  return (
    <ComputerContextProvider>
      <ResultsContext.Provider value={computer.results.asObservable()}>
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
      </ResultsContext.Provider>
    </ComputerContextProvider>
  );
};
