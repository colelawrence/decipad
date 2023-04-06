import { ELEMENT_PLOT, MyEditor, PlotElement } from '@decipad/editor-types';
import { Path } from 'slate';
import { insertNodes, requirePathBelowBlock } from '@decipad/editor-utils';
import { nanoid } from 'nanoid';
import { MarkType } from 'libs/ui/src/organisms/PlotParams/PlotParams';
import { clone } from 'lodash';

const getPlotElement = (
  markType: MarkType = 'bar',
  sourceVarName = ''
): PlotElement => ({
  id: nanoid(),
  type: ELEMENT_PLOT,
  title: 'Chart',
  sourceVarName,
  xColumnName: '',
  yColumnName: '',
  markType,
  thetaColumnName: '',
  sizeColumnName: '',
  colorColumnName: '',
  y2ColumnName: '',
  children: [{ text: '' }],
});

export const insertPlotBelow = (
  editor: MyEditor,
  path: Path,
  type?: MarkType,
  varName?: string
): void => {
  const plot = clone(getPlotElement(type, varName));

  const newPath = requirePathBelowBlock(editor, path);

  insertNodes(editor, plot, { at: newPath });
};
