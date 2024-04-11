import {
  type AutocompleteName,
  type RemoteComputer,
  type SerializedType,
  getExprRef,
  isTable as isComputerTable,
} from '@decipad/remote-computer';
import {
  type PlotElement,
  useMyEditorRef,
  type MyNode,
} from '@decipad/editor-types';
import { useNodePath, usePathMutatorCallback } from '@decipad/editor-hooks';
import { useComputer, useThemeFromStore } from '@decipad/react-contexts';
import { colorSchemes } from '@decipad/ui';
import uniq from 'lodash.uniq';
import { useEffect, useMemo } from 'react';
import { useResolved } from '@decipad/react-utils';
import { defaultPlotSpec } from './defaultPlotSpec';
import { normalizePlotSpec } from './normalizePlotSpec';
import {
  enhanceSpecFromWideData,
  resultToPlotResultData,
  specFromType,
} from './plotUtils';
import type { PlotData, PlotSpec } from './plotUtils.interface';
import { fixColorScheme } from './fixColorScheme';

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
  setY2ColumnName: StringSetter;
};

type UsePlotReturn = {
  spec?: PlotSpec;
  data?: PlotData;
  plotParams: PlotParams;
  repeatedColumns: string[];
};

type AutocompleteNameWithExpRef = AutocompleteName & {
  exprRef: string;
};

const autocompleteNameToExprRef = (
  computer: RemoteComputer,
  table: AutocompleteName
): AutocompleteNameWithExpRef => {
  return {
    ...table,
    exprRef: getExprRef(computer.getVarBlockId(table.name) ?? ''),
  };
};

const isTable = (name: AutocompleteName) =>
  !name.name.includes('.') && isComputerTable(name.type);

const shapes = ['point', 'circle', 'square', 'tick'] as const;

export type Shape = typeof shapes[number];

export const usePlot = (element: PlotElement): UsePlotReturn | undefined => {
  const [isDarkMode] = useThemeFromStore();
  const editor = useMyEditorRef();
  const computer = useComputer();
  const path = useNodePath(element);

  const names = computer.getNamesDefined$.useWithSelectorDebounced(500, (n) =>
    n.filter(isTable).map((table) => autocompleteNameToExprRef(computer, table))
  );

  const source = computer.getVarResult$.use(element.sourceVarName)?.result;
  const sourceType: SerializedType | undefined = source?.type;

  const data = useResolved<PlotData | undefined>(
    useMemo(() => resultToPlotResultData(source, element), [element, source])
  );

  const spec = useMemo(
    () =>
      fixColorScheme(
        (() => {
          const normalizedSpec = normalizePlotSpec(
            defaultPlotSpec(
              computer,
              source?.type,
              specFromType(computer, source?.type, element)
            )
          );
          if (normalizedSpec && data) {
            return enhanceSpecFromWideData(normalizedSpec, data);
          }
          return normalizedSpec;
        })(),
        isDarkMode
      ),
    [computer, data, element, isDarkMode, source?.type]
  );

  const setMarkType = usePathMutatorCallback(
    editor,
    path,
    'markType' as keyof MyNode,
    'usePlot'
  );

  const shape = useMemo(() => {
    if (shapes.includes(element.markType as Shape)) {
      return element.markType;
    }
    return undefined;
  }, [element.markType]);

  const setSourceVarName = usePathMutatorCallback<PlotElement>(
    editor,
    path,
    'sourceVarName',
    'usePlot'
  );
  const setXColumnName = usePathMutatorCallback<PlotElement>(
    editor,
    path,
    'xColumnName',
    'usePlot'
  );
  const setYColumnName = usePathMutatorCallback<PlotElement>(
    editor,
    path,
    'yColumnName',
    'usePlot'
  );
  const setSizeColumnName = usePathMutatorCallback<PlotElement>(
    editor,
    path,
    'sizeColumnName',
    'usePlot'
  );
  const setColorColumnName = usePathMutatorCallback<PlotElement>(
    editor,
    path,
    'colorColumnName',
    'usePlot'
  );
  const setThetaColumnName = usePathMutatorCallback<PlotElement>(
    editor,
    path,
    'thetaColumnName',
    'usePlot'
  );
  const setY2ColumnName = usePathMutatorCallback<PlotElement>(
    editor,
    path,
    'y2ColumnName',
    'usePlot'
  );
  const setColorScheme = usePathMutatorCallback<PlotElement>(
    editor,
    path,
    'colorScheme',
    'usePlot'
  );

  const repeatedColumns = useMemo((): string[] => {
    if (element.markType === 'arc') {
      return [element.thetaColumnName ?? ''];
    }
    return uniq([element.y2ColumnName, element.yColumnName])
      .filter((word) => word !== 'None')
      .filter(Boolean) as string[];
  }, [element]);

  const plotParams: PlotParams = useMemo(
    () => ({
      sourceVarNameOptions: names.map((name) => name.name),
      sourceExprRefOptions: names.map((name) => name.exprRef),
      columnNameOptions: isComputerTable(sourceType)
        ? sourceType.columnNames
        : [],
      setSourceVarName,
      setMarkType: setMarkType as StringSetter,
      setXColumnName,
      setYColumnName,
      setSizeColumnName,
      setColorColumnName,
      setThetaColumnName,
      setColorScheme,
      setY2ColumnName,
      ...element,
      setShape: setMarkType,
      shape,
    }),
    [
      names,
      sourceType,
      setSourceVarName,
      setMarkType,
      setXColumnName,
      setYColumnName,
      setSizeColumnName,
      setColorColumnName,
      setThetaColumnName,
      setColorScheme,
      setY2ColumnName,
      element,
      shape,
    ]
  );

  // Notebooks with charts that do not have a current color scheme need to be updated or they won't render.
  useEffect(() => {
    const colorScheme = plotParams.colorScheme as string;
    if (colorScheme && !Object.keys(colorSchemes).includes(colorScheme)) {
      plotParams.setColorScheme(Object.keys(colorSchemes)[0]);
    }
  }, [plotParams]);

  return useMemo(
    () => ({ spec, data, plotParams, repeatedColumns }),
    [data, plotParams, repeatedColumns, spec]
  );
};
