import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CALLOUT,
  ELEMENT_PARAGRAPH,
} from '@decipad/editor-types';
import { isBlockAboveEmpty, isSelectionAtBlockStart } from '@udecode/plate';

const resetBlockTypesCommonRule = {
  types: [ELEMENT_BLOCKQUOTE, ELEMENT_CALLOUT],
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
