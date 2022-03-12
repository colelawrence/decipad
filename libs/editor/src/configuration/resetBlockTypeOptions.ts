import { isBlockAboveEmpty, isSelectionAtBlockStart } from '@udecode/plate';
import { ELEMENT_BLOCKQUOTE, ELEMENT_PARAGRAPH } from '@decipad/editor-types';

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
