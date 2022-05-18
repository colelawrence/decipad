import {
  allowsTextStyling,
  getPathContainingSelection,
} from '@decipad/editor-utils';
import { MyEditor } from '@decipad/editor-types';

export const doesSelectionAllowTextStyling = (editor: MyEditor): boolean =>
  allowsTextStyling(editor, getPathContainingSelection(editor));
