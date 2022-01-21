import { nanoid } from 'nanoid';
import {
  Plate,
  PlatePluginComponent,
  PlateProps,
  useStoreEditorRef,
} from '@udecode/plate';
import { FC, useMemo, useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ProgramBlocksContextProvider } from '@decipad/ui';
import { ResultsContext } from '@decipad/react-contexts';
import {
  editorProgramBlocks,
  useLanguagePlugin,
} from './plugins/Language/useLanguagePlugin';
import { Tooltip } from './components';
import { components, options, plugins } from './configuration';
import { ComputerContextProvider } from './contexts/Computer';

export const NoDocSyncEditorBase = (props: PlateProps): ReturnType<FC> => {
  const [editorId] = useState(nanoid);

  const editor = useStoreEditorRef(editorId);
  useEffect(() => {
    if (editor) {
      editor.children = [
        {
          type: 'h1',
          children: [
            {
              text: '',
            },
          ],
        },
        {
          type: 'p',
          children: [
            {
              text: '',
            },
          ],
        },
      ];
    }
  }, [editor]);

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
    <DndProvider backend={HTML5Backend}>
      <ComputerContextProvider>
        <NoDocSyncEditorBase {...props} />
      </ComputerContextProvider>
    </DndProvider>
  );
};
