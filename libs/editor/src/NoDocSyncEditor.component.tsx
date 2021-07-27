import { SlatePlugins, SlatePluginsProps } from '@udecode/slate-plugins';
import { useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FormattingToolbar } from './components/FormattingToolbar';
import { SideFormattingMenu } from './components/SideFormattingMenu';
import { components, options, plugins } from './configuration';
import {
  SlashCommandsSelect,
  useSlashCommandsPlugin,
} from './plugins/SlashCommands';

export const Editor = (props: SlatePluginsProps) => {
  const { getSlashCommandsProps, plugin: slashCommandsPlugin } =
    useSlashCommandsPlugin();

  const editorPlugins = useMemo(
    () => [...plugins, slashCommandsPlugin],
    [slashCommandsPlugin]
  );

  return (
    <SlatePlugins
      id="no-doc-sync"
      plugins={editorPlugins}
      options={options}
      components={components}
      editableProps={{ autoFocus: true }}
      {...props}
    >
      <FormattingToolbar />
      <SlashCommandsSelect {...getSlashCommandsProps()} />
      <SideFormattingMenu />
    </SlatePlugins>
  );
};

export const NoDocSyncEditor = (props: SlatePluginsProps) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <Editor {...props} />
    </DndProvider>
  );
};
