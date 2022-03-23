import { Editor } from 'slate';
import {
  allowsTextStyling,
  getPathContainingSelection,
} from '@decipad/editor-utils';

export const doesSelectionAllowTextStyling = (editor: Editor): boolean =>
  allowsTextStyling(editor, getPathContainingSelection(editor));
