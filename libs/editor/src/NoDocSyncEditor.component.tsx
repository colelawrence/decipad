import { nanoid } from 'nanoid';
import { Plate, PlatePluginComponent, PlateProps } from '@udecode/plate';
import { FC, useMemo, useState } from 'react';
import { ProgramBlocksContextProvider } from '@decipad/ui';
import { ResultsContext } from '@decipad/react-contexts';
import {
  editorProgramBlocks,
  useLanguagePlugin,
} from './plugins/Language/useLanguagePlugin';
import { Tooltip } from './components';
import { components, options, plugins } from './configuration';
import { ComputerContextProvider } from './contexts/Computer';
import { POPULATE_PLAYGROUND } from './utils/storage';
import { emptyNotebook, introNotebook } from './exampleNotebooks';
import { useStoreEditorRef } from './contexts/useStoreEditorRef';

export const NoDocSyncEditorBase = (props: PlateProps): ReturnType<FC> => {
  const [editorId] = useState(nanoid);

  const editor = useStoreEditorRef(editorId);

  const { results, languagePlugin } = useLanguagePlugin();
  const programBlocks = editor ? editorProgramBlocks(editor) : {};

  const editorPlugins = useMemo(
    () => [...plugins, languagePlugin],
    [languagePlugin]
  );

  return (
    <ResultsContext.Provider value={results}>
      <ProgramBlocksContextProvider value={programBlocks}>
        <Plate
          id={editorId}
          plugins={editorPlugins}
          options={options}
          components={components as Record<string, PlatePluginComponent>}
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
    <ComputerContextProvider>
      <NoDocSyncEditorBase {...props} />
    </ComputerContextProvider>
  );
};
