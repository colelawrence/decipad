import {
  ELEMENT_PLOT,
  defaultPlotParams,
  type MarkType,
  type MyEditor,
  type PlotElement,
} from '@decipad/editor-types';
import { insertNodes, requirePathBelowBlock } from '@decipad/editor-utils';
import cloneDeep from 'lodash/cloneDeep';
import { nanoid } from 'nanoid';
import type { Path } from 'slate';

const getPlotElement = (
  markType: MarkType = 'bar',
  sourceVarName = ''
): PlotElement => ({
  id: nanoid(),
  type: ELEMENT_PLOT,
  title: '',
  sourceVarName,
  xColumnName: '',
  xAxisLabel: '',
  yAxisLabel: '',
  labelColumnName: '',
  markType,
  sizeColumnName: '',
  yColumnNames: [],
  yColumnChartTypes: [],
  ...defaultPlotParams,
  schema: 'jun-2024',
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

  insertNodes(editor, [plot], { at: newPath });
};
