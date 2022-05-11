import { ReactEditor } from 'slate-react';
import { PlotElement } from '@decipad/editor-types';
import { Computer, InBlockResult } from '@decipad/computer';
import { useElementMutatorCallback } from '@decipad/editor-utils';
import {
  enhanceSpecFromWideData,
  resultToPlotResultData,
  specFromType,
} from './plotUtils';
import { defaultPlotSpec } from './defaultPlotSpec';
import type { PlotSpec, PlotData } from './plotUtils';
import { normalizePlotSpec } from './normalizePlotSpec';

type StringSetter = (value: string) => void;

type PlotParams = Omit<PlotElement, 'children' | 'id' | 'type'> & {
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
  editor: ReactEditor;
  computer: Computer;
  element: PlotElement;
  result: InBlockResult | undefined;
}

const sourceTableVarNamesFromComputer = (
  computer: Computer,
  element: PlotElement
): string[] => {
  const names = computer.getNamesDefinedBefore([element.id, 0], false);
  return names
    .filter((name) => name.type.kind === 'table')
    .map((name) => name.name);
};

const sourceColumnNameOptionsFromComputer = (
  computer: Computer,
  element: PlotElement
): string[] => {
  const names = computer.getNamesDefinedBefore([element.id, 0], false);
  const name = names.find((varName) => varName.name === element.sourceVarName);
  if (!name) {
    return [];
  }
  const { type } = name;
  if (type.kind !== 'table') {
    return [];
  }
  return type.columnNames;
};

export const usePlot = ({
  editor,
  computer,
  element,
  result,
}: UsePlotProps): UsePlotReturn => {
  const sourceVarNameOptions = sourceTableVarNamesFromComputer(
    computer,
    element
  );
  const columnNameOptions = sourceColumnNameOptionsFromComputer(
    computer,
    element
  );

  let spec = normalizePlotSpec(
    defaultPlotSpec(result?.type, specFromType(result?.type, element))
  );
  const data = resultToPlotResultData(result, element);
  spec = spec && data && enhanceSpecFromWideData(spec, data);

  const plotParams: PlotParams = {
    sourceVarNameOptions,
    columnNameOptions,
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
