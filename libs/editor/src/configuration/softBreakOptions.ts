import { ELEMENT_BLOCKQUOTE, ELEMENT_CODE_BLOCK } from '@udecode/plate';

export const softBreakOptions = {
  rules: [
    { hotkey: 'shift+enter' },
    {
      hotkey: 'enter',
      query: {
        allow: [ELEMENT_CODE_BLOCK, ELEMENT_BLOCKQUOTE],
      },
    },
  ],
};
