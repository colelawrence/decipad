import { ELEMENT_CODE_LINE, Element } from '@decipad/editor-types';

export const editorNodesFromValue = (id: string, value: string): Element[] => [
  {
    id,
    type: ELEMENT_CODE_LINE,
    children: [
      {
        text: value,
      },
    ],
  },
];
