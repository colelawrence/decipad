import { ELEMENT_PLOT, PlotElement } from '@decipad/editor-types';
import { insertNodes, TEditor } from '@udecode/plate';
import { Path } from 'slate';
import { requirePathBelowBlock } from '@decipad/editor-utils';

const plotElement: Omit<PlotElement, 'id'> = {
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
};

export const insertPlotBelow = (editor: TEditor, path: Path): void => {
  insertNodes(editor, plotElement, {
    at: requirePathBelowBlock(editor, path),
  });
};
