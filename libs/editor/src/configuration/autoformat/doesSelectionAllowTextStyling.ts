import { Editor } from 'slate';
import { allowsTextStyling } from '../../utils/block';
import { getPathContainingSelection } from '../../utils/selection';

export const doesSelectionAllowTextStyling = (editor: Editor): boolean =>
  allowsTextStyling(editor, getPathContainingSelection(editor));
