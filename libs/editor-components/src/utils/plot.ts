import { ELEMENT_PLOT, MyEditor, PlotElement } from '@decipad/editor-types';
import { insertNodes } from '@udecode/plate';
import { Path } from 'slate';
import { requirePathBelowBlock } from '@decipad/editor-utils';

const plotElement = {
  type: ELEMENT_PLOT,
  title: 'Chart',
  sourceVarName: '',
  xColumnName: '',
  yColumnName: '',
  markType: 'bar',
  thetaColumnName: '',
  sizeColumnName: '',
  colorColumnName: '',
  children: [{ text: '' }],
} as PlotElement;

export const insertPlotBelow = (editor: MyEditor, path: Path): void => {
  insertNodes(editor, plotElement, {
    at: requirePathBelowBlock(editor, path),
  });
};
