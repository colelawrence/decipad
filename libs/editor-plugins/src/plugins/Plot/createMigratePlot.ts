import { createNormalizerPluginFactory } from '@decipad/editor-plugin-factories';
import {
  BasePlotProps,
  ChartColorSchemeKeys,
  ChartColorSchemeKeysArr,
  ELEMENT_PLOT,
  OldPlotElement,
  PlotDefaultColorScheme,
  PlotElement,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { dequal } from '@decipad/utils';
import { setNodes } from '@udecode/plate-common';
import { cloneDeep, merge, omit } from 'lodash';

function maybeColorScheme(
  colorScheme: string | undefined
): PlotElement['colorScheme'] {
  if (ChartColorSchemeKeysArr.includes(colorScheme as ChartColorSchemeKeys)) {
    return colorScheme as ChartColorSchemeKeys;
  }

  return PlotDefaultColorScheme;
}

function oldMarkTypeToNew(
  old: OldPlotElement['markType']
): PlotElement['markType'] {
  switch (old) {
    case 'circle':
    case 'square':
    case 'tick':
      return 'point';
    case 'bar':
    case 'arc':
    case 'line':
    case 'area':
    case 'point':
      return old;
  }
}

export function migrateOldSpecToNew(
  old: Partial<OldPlotElement>
): BasePlotProps {
  const newSpec: BasePlotProps = {
    sourceVarName: old.sourceVarName,

    markType: oldMarkTypeToNew(old.markType ?? 'line'),
    colorScheme: maybeColorScheme(old.colorScheme),
    yColumnNames:
      old.yColumnName && old.y2ColumnName && old.y2ColumnName !== 'None'
        ? [old.yColumnName, old.y2ColumnName]
        : old.yColumnName
        ? [old.yColumnName]
        : [],

    labelColumnName: undefined,
    sizeColumnName: undefined,

    orientation: 'horizontal',
    grid: true,
    startFromZero: true,
    mirrorYAxis: false,
    flipTable: false,
    groupByX: true,
    showDataLabel: false,

    barVariant: 'grouped',
    lineVariant: 'simple',
    arcVariant: 'simple',

    yColumnChartTypes: [],
    schema: 'jun-2024',
  };

  return newSpec;
}

export const createMigratePlotPlugin = createNormalizerPluginFactory({
  name: 'CREATE_MIGRATE_PLOT_PLUGIN',
  elementType: ELEMENT_PLOT,
  plugin:
    (editor) =>
    ([node, path]) => {
      // function to migrate from original plot to `jun-2024` version
      if (node.type !== ELEMENT_PLOT) {
        return false;
      }
      assertElementType(node, ELEMENT_PLOT);

      if (node.schema === 'jun-2024') return false;

      const newPlotNode = migrateOldSpecToNew(node as OldPlotElement);

      const clonedNode = cloneDeep(node);
      const clonedNewPlotNode = cloneDeep(newPlotNode);

      const migratedNode = merge(
        omit(clonedNode, 'children'),
        omit(clonedNewPlotNode, 'children')
      ) as PlotElement;

      if (dequal(migratedNode, node)) {
        return false;
      }

      return () =>
        setNodes(editor, { ...omit(migratedNode, 'children') }, { at: path });
    },
});
