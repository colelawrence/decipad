import { ELEMENT_PARAGRAPH } from '@udecode/plate';
import { Editor } from 'slate';
import { closestBlockAncestorHasType } from '../../utils/block';
import { requireSelectionPath } from '../../utils/selection';

export const isSelectionInParagraph = (editor: Editor): boolean =>
  closestBlockAncestorHasType(
    editor,
    requireSelectionPath(editor),
    ELEMENT_PARAGRAPH
  );
