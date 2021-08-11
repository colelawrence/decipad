import { Plate, PlateProps } from '@udecode/plate';
import { useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FormattingToolbar } from './components/FormattingToolbar';
import { components, options, plugins } from './configuration';
import {
  SlashCommandsSelect,
  useSlashCommandsPlugin,
} from './plugins/SlashCommands';

export const Editor = (props: PlateProps) => {
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
      <FormattingToolbar />
      <SlashCommandsSelect {...getSlashCommandsProps()} />
    </Plate>
  );
};

export const NoDocSyncEditor = (props: PlateProps) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <Editor {...props} />
    </DndProvider>
  );
};
