import { nanoid } from 'nanoid';
import { Plate, PlateProps, useStoreEditorRef } from '@udecode/plate';
import { FC, useMemo, useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  ProgramBlocksContextProvider,
  ResultsContextProvider,
} from '@decipad/ui';
import {
  editorProgramBlocks,
  useLanguagePlugin,
} from './plugins/Language/useLanguagePlugin';
import { Tooltip } from './components';
import { components, options, plugins } from './configuration';
import {
  SlashCommandsSelect,
  useSlashCommandsPlugin,
} from './plugins/SlashCommands';

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

  const { getSlashCommandsProps, plugin: slashCommandsPlugin } =
    useSlashCommandsPlugin();

  const editorPlugins = useMemo(
    () => [...plugins, slashCommandsPlugin, languagePlugin],
    [slashCommandsPlugin, languagePlugin]
  );

  return (
    <ResultsContextProvider value={results}>
      <ProgramBlocksContextProvider value={programBlocks}>
        <Plate
          id={editorId}
          plugins={editorPlugins}
          options={options}
          components={components}
          editableProps={{ autoFocus: true }}
          {...props}
        >
          <Tooltip />
          <SlashCommandsSelect {...getSlashCommandsProps()} />
        </Plate>
      </ProgramBlocksContextProvider>
    </ResultsContextProvider>
  );
};

export const NoDocSyncEditor = (props: PlateProps): ReturnType<FC> => {
  return (
    <DndProvider backend={HTML5Backend}>
      <NoDocSyncEditorBase {...props} />
    </DndProvider>
  );
};
