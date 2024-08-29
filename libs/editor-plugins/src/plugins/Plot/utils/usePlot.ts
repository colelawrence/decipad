import type { Computer } from '@decipad/computer-interfaces';
import {
  useComputer,
  useNodePath,
  usePathMutatorCallback,
} from '@decipad/editor-hooks';
import {
  defaultPlotParams,
  useMyEditorRef,
  type MyNode,
  type PlotElement,
  type PlotParams,
} from '@decipad/editor-types';
import { useResolved } from '@decipad/react-utils';
import {
  getExprRef,
  isTable as isComputerTable,
  isTableKind as isComputerTableKind,
  type AutocompleteName,
  type SerializedType,
} from '@decipad/remote-computer';
import { useMemo } from 'react';
import { resultToPlotResultData } from './plotUtils';
import type { PlotData } from './plotUtils.interface';

type UsePlotReturn = {
  data?: PlotData;
  unfiltered?: PlotData;
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
  !name.name.includes('.') && isComputerTableKind(name.kind);

function isNumber(type: SerializedType) {
  return type.kind === 'number';
}

function isBoolean(type: SerializedType) {
  return type.kind === 'boolean';
}

function isString(type: SerializedType) {
  return type.kind === 'string';
}

function isDate(type: SerializedType) {
  return type.kind === 'date';
}

const validTypes = [isNumber, isBoolean, isString, isDate];

function isValidType(type: SerializedType) {
  return validTypes.some((guard) => guard(type));
}

export const usePlot = (element: PlotElement): UsePlotReturn => {
  const editor = useMyEditorRef();
  const computer = useComputer();
  const path = useNodePath(element);

  const setMarkType = usePathMutatorCallback(
    editor,
    path,
    'markType' as keyof MyNode,
    'usePlot'
  );
  const setSourceVarName = usePathMutatorCallback<PlotElement>(
    editor,
    path,
    'sourceVarName',
    'usePlot'
  );
  const setXAxisLabel = usePathMutatorCallback<PlotElement>(
    editor,
    path,
    'xAxisLabel',
    'usePlot'
  );
  const setYAxisLabel = usePathMutatorCallback<PlotElement>(
    editor,
    path,
    'yAxisLabel',
    'usePlot'
  );
  const setXColumnName = usePathMutatorCallback<PlotElement>(
    editor,
    path,
    'xColumnName',
    'usePlot'
  );
  const setSizeColumnName = usePathMutatorCallback<PlotElement>(
    editor,
    path,
    'sizeColumnName',
    'usePlot'
  );
  const setLabelColumnName = usePathMutatorCallback<PlotElement>(
    editor,
    path,
    'labelColumnName',
    'usePlot'
  );
  const setOrientation = usePathMutatorCallback<PlotElement>(
    editor,
    path,
    'orientation',
    'usePlot'
  );
  const setBarVariant = usePathMutatorCallback<PlotElement>(
    editor,
    path,
    'barVariant',
    'usePlot'
  );
  const setLineVariant = usePathMutatorCallback<PlotElement>(
    editor,
    path,
    'lineVariant',
    'usePlot'
  );
  const setArcVariant = usePathMutatorCallback<PlotElement>(
    editor,
    path,
    'arcVariant',
    'usePlot'
  );
  const setGrid = usePathMutatorCallback<PlotElement>(
    editor,
    path,
    'grid',
    'usePlot'
  );
  const setShowDataLabel = usePathMutatorCallback<PlotElement>(
    editor,
    path,
    'showDataLabel',
    'usePlot'
  );
  const setStartFromZero = usePathMutatorCallback<PlotElement>(
    editor,
    path,
    'startFromZero',
    'usePlot'
  );
  const setMirrorYAxis = usePathMutatorCallback<PlotElement>(
    editor,
    path,
    'mirrorYAxis',
    'usePlot'
  );
  const setFlipTable = usePathMutatorCallback<PlotElement>(
    editor,
    path,
    'flipTable',
    'usePlot'
  );
  const setGroupByX = usePathMutatorCallback<PlotElement>(
    editor,
    path,
    'groupByX',
    'usePlot'
  );
  const setYColumnNames = usePathMutatorCallback<PlotElement>(
    editor,
    path,
    'yColumnNames',
    'usePlot'
  );
  const setYColumnChartTypes = usePathMutatorCallback<PlotElement>(
    editor,
    path,
    'yColumnChartTypes',
    'usePlot'
  );
  const setColorScheme = usePathMutatorCallback<PlotElement>(
    editor,
    path,
    'colorScheme',
    'usePlot'
  );

  const tableNames = computer.getNamesDefined$.useWithSelectorDebounced(
    500,
    (n) =>
      n
        .filter(isTable)
        .map((table) => autocompleteNameToExprRef(computer, table))
  );

  const source = computer.getVarResult$.use(
    element.sourceVarName ?? ''
  )?.result;
  const sourceType: SerializedType | undefined = source?.type;

  const resolvedResult = useResolved(
    useMemo(() => resultToPlotResultData(source, element), [element, source])
  );

  const mergedElement = useMemo(
    () => ({ ...defaultPlotParams, ...element }),
    [element]
  );

  const allNameOptions = useMemo(() => {
    return isComputerTable(sourceType) ? sourceType.columnNames : [];
  }, [sourceType]);

  const allTypeOptions = useMemo(() => {
    return isComputerTable(sourceType) ? sourceType.columnTypes : [];
  }, [sourceType]);

  const { columnNameOptions, columnTypeOptions } = useMemo(() => {
    const fColumnNameOptions = [];
    const fColumnTypeOptions = [];
    for (let i = 0; i < allTypeOptions.length; i++) {
      if (isValidType(allTypeOptions[i])) {
        fColumnNameOptions.push(allNameOptions[i]);
        fColumnTypeOptions.push(allTypeOptions[i]);
      }
    }
    return {
      columnTypeOptions: fColumnTypeOptions,
      columnNameOptions: fColumnNameOptions,
    };
  }, [allNameOptions, allTypeOptions]);

  const plotParams: PlotParams = useMemo(
    () => ({
      sourceVarNameOptions: tableNames.map((name) => name.name),
      sourceExprRefOptions: tableNames.map((name) => name.exprRef),
      columnNameOptions,
      columnTypeOptions,
      setSourceVarName,
      setMarkType: setMarkType as (value: string) => void,
      setXColumnName,
      setSizeColumnName,
      setColorScheme,
      setYColumnNames,
      setYColumnChartTypes,
      setOrientation,
      setXAxisLabel,
      setYAxisLabel,
      setStartFromZero,
      setGroupByX,
      setMirrorYAxis,
      setFlipTable,
      setGrid,
      setLineVariant,
      setShowDataLabel,
      setArcVariant,
      setBarVariant,
      setLabelColumnName,
      ...mergedElement,
      setShape: setMarkType,
    }),
    [
      tableNames,
      columnNameOptions,
      columnTypeOptions,
      setSourceVarName,
      setMarkType,
      setXColumnName,
      setSizeColumnName,
      setColorScheme,
      setYColumnNames,
      setYColumnChartTypes,
      setOrientation,
      setXAxisLabel,
      setYAxisLabel,
      setStartFromZero,
      setGroupByX,
      setMirrorYAxis,
      setFlipTable,
      setGrid,
      setLineVariant,
      setShowDataLabel,
      setArcVariant,
      setBarVariant,
      setLabelColumnName,
      mergedElement,
    ]
  );

  return useMemo(
    () => ({
      data: resolvedResult?.data,
      unfiltered: resolvedResult?.unfiltered,
      plotParams,
    }),
    [plotParams, resolvedResult?.data, resolvedResult?.unfiltered]
  );
};
