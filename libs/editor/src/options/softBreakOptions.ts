import { SoftBreakPluginOptions } from '@udecode/slate-plugins';

export const softBreakPluginOptions: SoftBreakPluginOptions = {
  rules: [
    { hotkey: 'shift+enter' },
    {
      hotkey: 'enter',
      query: {
        allow: ['blockquote', 'code_block'],
      },
    },
  ],
};
