import { ELEMENT_PLOT, MyEditor, PlotElement } from '@decipad/editor-types';
import { insertNodes, requirePathBelowBlock } from '@decipad/editor-utils';
import { MarkType } from 'libs/ui/src/organisms/PlotParams/PlotParams';
import cloneDeep from 'lodash.clonedeep';
import { nanoid } from 'nanoid';
import { Path } from 'slate';

const getPlotElement = (
  markType: MarkType = 'bar',
  sourceVarName = ''
): PlotElement => ({
  id: nanoid(),
  type: ELEMENT_PLOT,
  title: '',
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
  const plot = cloneDeep(getPlotElement(type, varName));

  const newPath = requirePathBelowBlock(editor, path);

  insertNodes(editor, plot, { at: newPath });
};
