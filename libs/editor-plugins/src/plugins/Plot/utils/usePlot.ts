import { MyEditor, PlotElement } from '@decipad/editor-types';
import { Computer, Result, AutocompleteName } from '@decipad/computer';
import { useElementMutatorCallback } from '@decipad/editor-utils';
import { useComputer } from '@decipad/react-contexts';
import type { PlotData, PlotSpec } from './plotUtils';
import {
  enhanceSpecFromWideData,
  resultToPlotResultData,
  specFromType,
} from './plotUtils';
import { defaultPlotSpec } from './defaultPlotSpec';
import { normalizePlotSpec } from './normalizePlotSpec';

type StringSetter = (value: string) => void;

export type PlotParams = Omit<PlotElement, 'children' | 'id' | 'type'> & {
  sourceVarNameOptions: string[];
  columnNameOptions: string[];
  setSourceVarName: StringSetter;
  setMarkType: StringSetter;
  setXColumnName: StringSetter;
  setYColumnName: StringSetter;
  setSizeColumnName: StringSetter;
  setColorColumnName: StringSetter;
  setThetaColumnName: StringSetter;
  setColorScheme: StringSetter;
};

type UsePlotReturn = {
  spec?: PlotSpec;
  data?: PlotData;
  plotParams: PlotParams;
};

interface UsePlotProps {
  editor: MyEditor;
  computer: Computer;
  element: PlotElement;
  result: Result.Result | undefined;
}

const isTable = (name: AutocompleteName) => name.type.kind === 'table';

export const usePlot = ({
  editor,
  element,
  result,
}: UsePlotProps): UsePlotReturn => {
  const computer = useComputer();
  const names = computer.getNamesDefined$.useWithSelector((n) =>
    n.filter(isTable)
  );
  const table = names.find((varName) => varName.name === element.sourceVarName);
  const columns =
    (table?.type.kind === 'table' && table.type.columnNames) || [];

  let spec = normalizePlotSpec(
    defaultPlotSpec(
      computer,
      result?.type,
      specFromType(computer, result?.type, element)
    )
  );
  const data = resultToPlotResultData(result, element);
  spec = spec && data && enhanceSpecFromWideData(spec, data);

  const plotParams: PlotParams = {
    sourceVarNameOptions: names.map((name) => name.name),
    columnNameOptions: columns,
    setSourceVarName: useElementMutatorCallback(
      editor,
      element,
      'sourceVarName'
    ),
    setMarkType: useElementMutatorCallback(editor, element, 'markType'),
    setXColumnName: useElementMutatorCallback(editor, element, 'xColumnName'),
    setYColumnName: useElementMutatorCallback(editor, element, 'yColumnName'),
    setSizeColumnName: useElementMutatorCallback(
      editor,
      element,
      'sizeColumnName'
    ),
    setColorColumnName: useElementMutatorCallback(
      editor,
      element,
      'colorColumnName'
    ),
    setThetaColumnName: useElementMutatorCallback(
      editor,
      element,
      'thetaColumnName'
    ),
    setColorScheme: useElementMutatorCallback(editor, element, 'colorScheme'),
    ...element,
  };

  return { spec, data, plotParams };
};
