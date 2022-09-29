import { PlotElement, useTEditorRef } from '@decipad/editor-types';
import { Computer, AutocompleteName, getExprRef } from '@decipad/computer';
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
  sourceExprRefOptions: string[];
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

type AutocompleteNameWithExpRef = AutocompleteName & {
  exprRef: string;
};

const autocompleteNameToExprRef = (
  computer: Computer,
  table: AutocompleteName
): AutocompleteNameWithExpRef => {
  return {
    ...table,
    exprRef: getExprRef(computer.getVarBlockId(table.name) ?? ''),
  };
};

const isTable = (name: AutocompleteName) =>
  !name.name.includes('.') && name.type.kind === 'table';

export const usePlot = (element: PlotElement): UsePlotReturn => {
  const editor = useTEditorRef();
  const computer = useComputer();

  const names = computer.getNamesDefined$.useWithSelector((n) =>
    n.filter(isTable).map((table) => autocompleteNameToExprRef(computer, table))
  );

  const source = computer.getVarResult$.use(element.sourceVarName)?.result;

  const columns =
    (source?.type.kind === 'table' && source.type.columnNames) || [];

  let spec = normalizePlotSpec(
    defaultPlotSpec(
      computer,
      source?.type,
      specFromType(computer, source?.type, element)
    )
  );
  const data = resultToPlotResultData(source, element);

  spec = spec && data && enhanceSpecFromWideData(spec, data);

  const plotParams: PlotParams = {
    sourceVarNameOptions: names.map((name) => name.name),
    sourceExprRefOptions: names.map((name) => name.exprRef),
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
