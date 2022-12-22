import { ELEMENT_PLOT, MyEditor, PlotElement } from '@decipad/editor-types';
import { Path } from 'slate';
import { insertNodes, requirePathBelowBlock } from '@decipad/editor-utils';
import { nanoid } from 'nanoid';

const getPlotElement = () =>
  ({
    id: nanoid(),
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
  } as PlotElement);

export const insertPlotBelow = (editor: MyEditor, path: Path): void => {
  insertNodes(editor, getPlotElement(), {
    at: requirePathBelowBlock(editor, path),
  });
};
