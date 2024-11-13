import type { MyElement } from '@decipad/editor-types';
import { ELEMENT_CODE_LINE } from '@decipad/editor-types';

export const editorNodesFromValue = (
  id: string,
  value: string
): MyElement[] => [
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
