import { ExitBreakPluginOptions } from '@udecode/slate-plugins';

export const exitBreakPluginOptions: ExitBreakPluginOptions = {
  rules: [
    {
      hotkey: 'mod+enter',
    },
    {
      hotkey: 'mod+shift+enter',
      before: true,
    },
    {
      hotkey: 'enter',
      query: {
        start: true,
        end: true,
        allow: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'divider'],
      },
    },
  ],
};
