import { SlatePlugins, SlatePluginsProps } from '@udecode/slate-plugins';
import React, { useMemo } from 'react';
import { SideFormattingMenu } from './components/SideFormattingMenu';
import { components, options, plugins } from './configuration';
import {
  SlashCommandsSelect,
  useSlashCommandsPlugin,
} from './plugins/SlashCommands';

export const NoDocSyncEditor = (props: SlatePluginsProps) => {
  const { getSlashCommandsProps, plugin: slashCommandsPlugin } =
    useSlashCommandsPlugin();

  const editorPlugins = useMemo(
    () => [...plugins, slashCommandsPlugin],
    [slashCommandsPlugin]
  );

  return (
    <div>
      <SlatePlugins
        plugins={editorPlugins}
        options={options}
        components={components}
        editableProps={{ autoFocus: true }}
        {...props}
      />
      <SlashCommandsSelect {...getSlashCommandsProps()} />
      <SideFormattingMenu />
    </div>
  );
};
