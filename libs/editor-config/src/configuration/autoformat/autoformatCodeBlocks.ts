import { ELEMENT_CODE_LINE, MyAutoformatRule } from '@decipad/editor-types';
import {
  insertStructuredCodeLineBelowOrReplace,
  requireCollapsedSelection,
} from '@decipad/editor-utils';
import { RemoteComputer } from '@decipad/remote-computer';
import { doesSelectionAllowTextStyling } from './doesSelectionAllowTextStyling';

export const autoformatCodeBlocks = (
  computer: RemoteComputer
): MyAutoformatRule[] => [
  {
    mode: 'block',
    type: ELEMENT_CODE_LINE,
    match: '```',
    query: doesSelectionAllowTextStyling,
    triggerAtBlockStart: false,
    format: (editor): void =>
      insertStructuredCodeLineBelowOrReplace({
        editor,
        path: requireCollapsedSelection(editor).path,
        select: true,
        code: '14 * 3',
        getAvailableIdentifier: computer.getAvailableIdentifier.bind(computer),
      }),
  },
];
