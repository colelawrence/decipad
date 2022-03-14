import { ResultsContext } from '@decipad/react-contexts';
import { ProgramBlocksContextProvider } from '@decipad/ui';
import { Plate, PlatePluginComponent, PlateProps } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { FC, useMemo, useState } from 'react';
import * as configuration from './configuration';
import * as contexts from './contexts';
import { useStoreEditorRef } from './contexts/useStoreEditorRef';
import { emptyNotebook, introNotebook } from './exampleNotebooks';
import { Tooltip } from './plate-components';
import { editorProgramBlocks, useLanguagePlugin } from './plugins';
import { POPULATE_PLAYGROUND } from './utils/storage';

export const NoDocSyncEditorBase = (props: PlateProps): ReturnType<FC> => {
  const [editorId] = useState(nanoid);

  const editor = useStoreEditorRef(editorId);

  const { results, languagePlugin } = useLanguagePlugin();
  const programBlocks = editor ? editorProgramBlocks(editor) : {};

  const editorPlugins = useMemo(
    () => [...configuration.plugins, languagePlugin],
    [languagePlugin]
  );

  return (
    <ResultsContext.Provider value={results}>
      <ProgramBlocksContextProvider value={programBlocks}>
        <Plate
          id={editorId}
          plugins={editorPlugins}
          options={configuration.options}
          components={
            configuration.components as Record<string, PlatePluginComponent>
          }
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
    <contexts.ComputerContextProvider>
      <NoDocSyncEditorBase {...props} />
    </contexts.ComputerContextProvider>
  );
};
