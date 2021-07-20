import {
  ELEMENT_H1,
  ELEMENT_PARAGRAPH,
  SlatePlugins,
} from '@udecode/slate-plugins';
import React, { useMemo } from 'react';
import { SideFormattingMenu } from './components/SideFormattingMenu';
import { components, options, plugins } from './configuration';
import {
  SlashCommandsSelect,
  useSlashCommandsPlugin,
} from './plugins/SlashCommands';

export const NoDocSyncEditor = () => {
  const { getSlashCommandsProps, plugin: slashCommandsPlugin } =
    useSlashCommandsPlugin();

  const editorPlugins = useMemo(
    () => [...plugins, slashCommandsPlugin],
    [slashCommandsPlugin]
  );

  return (
    <div>
      <SlatePlugins
        initialValue={[
          { type: ELEMENT_H1, children: [{ text: 'Title' }] },
          { type: ELEMENT_PARAGRAPH, children: [{ text: '' }] },
        ]}
        plugins={editorPlugins}
        options={options}
        components={components}
        editableProps={{ autoFocus: true }}
      />
      <SlashCommandsSelect {...getSlashCommandsProps()} />
      <SideFormattingMenu />
    </div>
  );
};
