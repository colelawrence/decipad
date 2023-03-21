import { PlotElement, useTEditorRef } from '@decipad/editor-types';
import _ from 'lodash';
import { Computer, AutocompleteName, getExprRef } from '@decipad/computer';
import { useElementMutatorCallback } from '@decipad/editor-utils';
import { useComputer, useThemeFromStore } from '@decipad/react-contexts';
import { colorSchemes } from '@decipad/ui';
import { useEffect, useMemo } from 'react';
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

const shapes = ['point', 'circle', 'square', 'tick'] as const;

export type Shape = typeof shapes[number];

export const usePlot = (element: PlotElement): UsePlotReturn => {
  const [isDarkMode] = useThemeFromStore();
  const editor = useTEditorRef();
  const computer = useComputer();

  const names = computer.getNamesDefined$.useWithSelector((n) =>
    n.filter(isTable).map((table) => autocompleteNameToExprRef(computer, table))
  );

  const source = computer.getVarResult$.use(element.sourceVarName)?.result;

  let spec = normalizePlotSpec(
    defaultPlotSpec(
      computer,
      source?.type,
      specFromType(computer, source?.type, element)
    )
  );

  const data = resultToPlotResultData(source, element);

  spec = spec && data && enhanceSpecFromWideData(spec, data);

  const setMarkType = useElementMutatorCallback(editor, element, 'markType');

  const shape = useMemo(() => {
    if (shapes.includes(element.markType as Shape)) {
      return element.markType;
    }
    return undefined;
  }, [element.markType]);

  const setSourceVarName = useElementMutatorCallback(
    editor,
    element,
    'sourceVarName'
  );
  const setXColumnName = useElementMutatorCallback(
    editor,
    element,
    'xColumnName'
  );
  const setYColumnName = useElementMutatorCallback(
    editor,
    element,
    'yColumnName'
  );
  const setSizeColumnName = useElementMutatorCallback(
    editor,
    element,
    'sizeColumnName'
  );
  const setColorColumnName = useElementMutatorCallback(
    editor,
    element,
    'colorColumnName'
  );
  const setThetaColumnName = useElementMutatorCallback(
    editor,
    element,
    'thetaColumnName'
  );
  const setColorScheme = useElementMutatorCallback(
    editor,
    element,
    'colorScheme'
  );

  const plotParams: PlotParams = useMemo(
    () => ({
      sourceVarNameOptions: names.map((name) => name.name),
      sourceExprRefOptions: names.map((name) => name.exprRef),
      columnNameOptions:
        (source?.type.kind === 'table' && source.type.columnNames) || [],
      setSourceVarName,
      setMarkType: setMarkType as StringSetter,
      setXColumnName,
      setYColumnName,
      setSizeColumnName,
      setColorColumnName,
      setThetaColumnName,
      setColorScheme,
      ...element,
      setShape: setMarkType,
      shape,
    }),
    [
      element,
      names,
      setColorColumnName,
      setColorScheme,
      setMarkType,
      setSizeColumnName,
      setSourceVarName,
      setThetaColumnName,
      setXColumnName,
      setYColumnName,
      shape,
      source,
    ]
  );

  // Notebooks with charts that do not have a current color scheme need to be updated or they won't render.
  useEffect(() => {
    const colorScheme = plotParams.colorScheme as string;
    if (colorScheme && !Object.keys(colorSchemes).includes(colorScheme)) {
      plotParams.setColorScheme(Object.keys(colorSchemes)[0]);
    }
  }, [plotParams]);

  if (spec) {
    // config.encoding.color.scheme
    _.update(
      spec,
      'config.encoding.color.scheme',
      (theme: string) => `${theme}_${isDarkMode ? 'dark' : 'light'}`
    );
    // encoding.color.scale.scheme
    _.update(
      spec,
      'encoding.color.scale.scheme',
      (theme: string) => `${theme}_${isDarkMode ? 'dark' : 'light'}`
    );
  }

  return { spec, data, plotParams };
};
