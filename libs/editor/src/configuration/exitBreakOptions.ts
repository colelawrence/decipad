import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_PARAGRAPH,
  ELEMENT_CODE_LINE,
  ELEMENT_CALLOUT,
} from '@decipad/editor-types';

export const exitBreakOptions = {
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
        allow: [
          ELEMENT_H1,
          ELEMENT_H2,
          ELEMENT_H3,
          ELEMENT_PARAGRAPH,
          ELEMENT_CODE_LINE,
          ELEMENT_CALLOUT,
        ],
      },
    },
  ],
};
