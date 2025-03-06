import {
  AcceptableChartShapesForCombo,
  MarkType,
  PlotArcVariant,
  PlotBarVariant,
  PlotLineVariant,
  PlotParams,
} from '@decipad/editor-types';
import {
  AreaChart,
  BarChart,
  FunnelChart,
  LineChart,
  PieChart,
  PointChart,
  RadarChart,
} from 'libs/ui/src/icons';
import { ComboChart } from 'libs/ui/src/icons/ComboChart';
import { colorSchemes } from 'libs/ui/src/primitives';
import { ReactNode } from 'react';

export type StringSetter<T extends string | undefined = string> = (
  str: T
) => void;

export const markTypeIcons: Record<MarkType, ReactNode> = {
  bar: <BarChart />,
  line: <LineChart />,
  point: <PointChart />,
  arc: <PieChart />,
  area: <AreaChart />,
  combo: <ComboChart />,
  funnel: <FunnelChart />,
  radar: <RadarChart />,
};

export const markTypeIsDisabled: Record<MarkType, boolean> = {
  bar: false,
  line: false,
  point: false,
  area: false,
  arc: false,
  combo: false,
  radar: false,
  funnel: false,
};

export const markTypeNames: Record<MarkType, string> = {
  bar: 'Bar',
  line: 'Line',
  point: 'Scatter',
  area: 'Area',
  arc: 'Pie',
  combo: 'Combo',
  radar: 'Radar',
  funnel: 'Funnel',
};

export interface LineChartStyleOption {
  key: PlotLineVariant;
  type: 'line';
  label: string;
}

export interface BarChartStyleOption {
  key: PlotBarVariant;
  type: 'bar';
  label: string;
}

export interface ArcChartStyleOption {
  key: PlotArcVariant;
  type: 'arc';
  label: string;
}

export type ChartStyleOption =
  | LineChartStyleOption
  | BarChartStyleOption
  | ArcChartStyleOption;

export type PlotParamsProps = PlotParams;

export type SubMenuKey =
  | 'source-table'
  | 'chart-type'
  | 'shape'
  | 'colors'
  | 'color-scheme'
  | 'slice-size'
  | 'label'
  | 'scatterlabel'
  | 'point-size'
  | 'color-scheme_monochrome'
  | 'color-scheme_multicolor'
  | 'addvalue'
  | 'chart-variant'
  | 'value2'
  | 'size';

export type ColorSchemeUniqueName = keyof typeof colorSchemes;

export type TablePickerProps = { resetChart: () => void } & Pick<
  PlotParamsProps,
  'sourceVarNameOptions' | 'sourceExprRefOptions' | 'setSourceVarName'
>;

export interface ColumnActionBaseButton {
  icon: ReactNode;
  label: string;
  onSelect?: () => void;
}

export interface ColumnActionComboButton {
  icon: ReactNode;
  label: AcceptableChartShapesForCombo;
  onSelect?: () => void;
}

export interface ColumnActionBaseButtonWithAction
  extends ColumnActionBaseButton {
  onSelect: () => void;
}

interface ColumnActionSimpleButton extends ColumnActionBaseButtonWithAction {
  type: 'simple';
}

interface ColumnActionSubmenuButton {
  type: 'combo';
  selected: AcceptableChartShapesForCombo;
  options: ColumnActionComboButton[];
}

export type ColumnActionButton =
  | ColumnActionSimpleButton
  | ColumnActionSubmenuButton;

export interface ColumnActionItemProps {
  columnNames: string[];
  getButtons: (columnName: string) => ColumnActionButton[];
  preventDefault?: boolean;
  onSelect?: () => void;
  testIdPrefix?: string;
}
