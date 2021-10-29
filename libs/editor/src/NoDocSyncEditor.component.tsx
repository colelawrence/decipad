import { Plate, PlateProps } from '@udecode/plate';
import { FC, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Tooltip } from './components';
import { components, options, plugins } from './configuration';
import {
  SlashCommandsSelect,
  useSlashCommandsPlugin,
} from './plugins/SlashCommands';

export const Editor = (props: PlateProps): ReturnType<FC> => {
  const { getSlashCommandsProps, plugin: slashCommandsPlugin } =
    useSlashCommandsPlugin();

  const editorPlugins = useMemo(
    () => [...plugins, slashCommandsPlugin],
    [slashCommandsPlugin]
  );

  return (
    <Plate
      id="no-doc-sync"
      plugins={editorPlugins}
      options={options}
      components={components}
      editableProps={{ autoFocus: true }}
      {...props}
    >
      <Tooltip />
      <SlashCommandsSelect {...getSlashCommandsProps()} />
    </Plate>
  );
};

export const NoDocSyncEditor = (props: PlateProps): ReturnType<FC> => {
  return (
    <DndProvider backend={HTML5Backend}>
      <Editor {...props} />
    </DndProvider>
  );
};
