import { ELEMENT_BLOCKQUOTE, ELEMENT_PARAGRAPH } from '@decipad/editor-types';
import { isBlockAboveEmpty, isSelectionAtBlockStart } from '@udecode/plate';

const resetBlockTypesCommonRule = {
  types: [ELEMENT_BLOCKQUOTE],
  defaultType: ELEMENT_PARAGRAPH,
};

export const resetBlockTypeOptions = {
  rules: [
    {
      ...resetBlockTypesCommonRule,
      hotkey: 'Enter',
      predicate: isBlockAboveEmpty,
    },
    {
      ...resetBlockTypesCommonRule,
      hotkey: 'Backspace',
      predicate: isSelectionAtBlockStart,
    },
  ],
};
