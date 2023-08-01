import { css } from '@emotion/react';
import { ComponentProps, FC, ReactNode, useMemo } from 'react';
import {
  AreaChartSlash,
  BarChartSlash,
  Blockquote,
  CSV,
  Calculations,
  Callout,
  DataView,
  DatePicker,
  Divider,
  Dropdown,
  FormulaSlash,
  Heading1,
  Heading2,
  Image,
  Input,
  Integrations,
  LineChartSlash,
  PieChartSlash,
  Result,
  ScatterPlotSlash,
  Sketch,
  Slider,
  TableSlash,
  Toggle,
  Value,
} from '../../icons';
import { InlineMenu } from '../../organisms';

type Theme = 'Ocean' | 'Mint' | 'Orange' | 'Wine' | 'Daffodil';

const paintIcon = (icon: ReactNode, theme?: Theme): ReactNode => {
  const groupIcon = theme ? css({}) : {};
  return <span css={groupIcon}>{icon}</span>;
};

const integrationCmd = (paint?: Theme) => ({
  command: 'open-integration',
  title: 'Integrations',
  description: 'Connect to existing data',
  icon: paintIcon(<Integrations />, paint),
  enabled: true,
  extraSearchTerms: [
    'data',
    'import',
    'external',
    'sql',
    'web',
    'csv',
    'google sheets',
    'gsheets',
    'js',
    'javascript',
    'sheets',
    'integrations',
    'js',
    'javascript',
    'code',
  ],
});

const sliderCmd = (paint?: Theme) => ({
  command: 'slider',
  title: 'Slider',
  description: 'Define a slider others can update',
  icon: paintIcon(<Slider />, paint),
  enabled: true,
  extraSearchTerms: ['input', 'slider'],
});

const pivotCmd = (paint?: Theme) => ({
  command: 'data-view',
  title: 'Data view',
  description: 'Pivot table data',
  icon: paintIcon(<DataView />, paint),
  enabled: true,
  extraSearchTerms: [
    'group',
    'sort',
    'analyze',
    'pivot',
    'data',
    'view',
    'filter',
    'analytic',
  ],
});

const structuredCmd = (paint?: Theme) => ({
  command: 'structured-input',
  title: 'Number Input',
  description: 'Create a number',
  icon: paintIcon(<Value />, paint),
  enabled: true,
  extraSearchTerms: ['number', 'input'],
});

const tableCmd = (paint?: Theme) => ({
  command: 'table',
  title: 'Table',
  description: 'Create a table to input data',
  icon: paintIcon(<TableSlash />, paint),
  enabled: true,
  extraSearchTerms: [],
});

const dataItems = (paint: boolean) => {
  const color = paint ? 'Orange' : undefined;
  return [
    structuredCmd(color),
    {
      command: 'structured-code-line',
      title: 'Formula',
      description: 'Create a calculation',
      icon: paintIcon(<FormulaSlash />, color),
      enabled: true,
      extraSearchTerms: ['formula', 'calculation'],
    },
    tableCmd(color),
    {
      command: 'calculation-block',
      title: 'Advanced formula',
      description: 'Combine formulas',
      icon: paintIcon(<Calculations />, color),
      enabled: true,
      extraSearchTerms: ['decipad', 'calculation', 'language', 'formula'],
    },
  ];
};

const modelGroup = (paint: boolean) => ({
  title: 'Model',
  items: dataItems(paint),
});

const integrationsGroups = (paint: boolean) => ({
  title: 'Integrations',
  items: [
    integrationCmd(paint ? 'Daffodil' : undefined),
    {
      command: 'upload-csv',
      title: 'CSV',
      description: 'Upload an CSV file',
      icon: paintIcon(<CSV />, paint ? 'Daffodil' : undefined),
      enabled: true,
      extraSearchTerms: ['upload', 'csv', 'data', 'excel'],
    },
  ],
});

const mostFrequentlyUsedGroup = (paint: boolean) => ({
  title: 'Most used',
  items: [
    sliderCmd(paint ? 'Mint' : undefined),
    structuredCmd(paint ? 'Orange' : undefined),
    tableCmd(paint ? 'Orange' : undefined),
    integrationCmd(paint ? 'Daffodil' : undefined),
    pivotCmd(paint ? 'Wine' : undefined),
  ],
});

const visualisationGroup = (paint: boolean) => ({
  title: 'Visualizations',
  items: [
    pivotCmd(paint ? 'Wine' : undefined),
    {
      command: 'pie-chart',
      title: 'Pie Chart',
      description: 'Visualize data on a pie chart',
      icon: paintIcon(<PieChartSlash />, paint ? 'Wine' : undefined),
      enabled: true,
      extraSearchTerms: ['chart', 'visualisation', 'plot'],
    },
    {
      command: 'line-chart',
      title: 'Line Chart',
      description: 'Visualise data on a line chart',
      icon: paintIcon(<LineChartSlash />, paint ? 'Wine' : undefined),
      enabled: true,
      extraSearchTerms: ['chart', 'visualisation', 'plot', 'line plot'],
    },
    {
      command: 'bar-chart',
      title: 'Bar Chart',
      description: 'Visualise dta on a bar chart',
      icon: paintIcon(<BarChartSlash />, paint ? 'Wine' : undefined),
      enabled: true,
      extraSearchTerms: ['chart', 'visualisation', 'plot', 'bar plot'],
    },
    {
      command: 'area-chart',
      title: 'Area Chart',
      description: 'Visualize data on an area chart',
      icon: paintIcon(<AreaChartSlash />, paint ? 'Wine' : undefined),
      enabled: true,
      extraSearchTerms: ['chart', 'visualisation', 'plot', 'area plot'],
    },
    {
      command: 'scatter-plot',
      title: 'Scatter Plot',
      description: 'Visualise data on a scatter plot',
      icon: paintIcon(<ScatterPlotSlash />, paint ? 'Wine' : undefined),
      enabled: true,
      extraSearchTerms: ['point plot', 'chart', 'visualisation', 'plot'],
    },
  ],
});

const widgetGroup = (paint: boolean) => ({
  title: 'Widgets',
  items: [
    {
      command: 'input',
      title: 'Input',
      description: 'Define values others can update',
      icon: paintIcon(<Input />, paint ? 'Mint' : undefined),
      enabled: true,
      extraSearchTerms: ['input'],
    },
    sliderCmd(paint ? 'Mint' : undefined),
    {
      command: 'dropdown',
      title: 'Dropdown',
      description: 'Define pre-selected options',
      icon: paintIcon(<Dropdown />, paint ? 'Mint' : undefined),
      enabled: true,
      extraSearchTerms: ['dropdown', 'list', 'select', 'options'],
    },
    {
      command: 'datepicker',
      title: 'Date',
      description: 'Define a data picker',
      icon: paintIcon(<DatePicker />, paint ? 'Mint' : undefined),
      enabled: true,
      extraSearchTerms: ['input', 'date', 'calendar', 'pick'],
    },
    {
      command: 'toggle',
      title: 'Toggle',
      description: 'Define a switcher for booleans',
      icon: paintIcon(<Toggle />, paint ? 'Mint' : undefined),
      enabled: true,
      extraSearchTerms: ['switch', 'toggle', 'boolean'],
    },
    {
      command: 'display',
      title: 'Result',
      description: 'Highlight a result',
      icon: paintIcon(<Result />, paint ? 'Mint' : undefined),
      enabled: true,
      extraSearchTerms: ['display', 'result', 'show'],
    },
  ],
});

const writingGroup = (paint: boolean) => ({
  title: 'Writing',
  items: [
    {
      command: 'heading1',
      title: 'Heading',
      description: 'Main text heading',
      icon: paintIcon(<Heading1 />, paint ? 'Ocean' : undefined),
      enabled: true,
      extraSearchTerms: ['h1', '#'],
    },
    {
      command: 'heading2',
      title: 'Sub-heading',
      description: 'Secondary text heading',
      icon: paintIcon(<Heading2 />, paint ? 'Ocean' : undefined),
      enabled: true,
      extraSearchTerms: ['h2', '##'],
    },
    {
      command: 'upload-image',
      title: 'Image',
      description: 'Upload an image',
      icon: paintIcon(<Image />, paint ? 'Ocean' : undefined),
      enabled: true,
      extraSearchTerms: ['upload', 'image', 'media'],
    },
    {
      command: 'callout',
      title: 'Callout',
      description: 'Grabs the readers attention',
      icon: paintIcon(<Callout />, paint ? 'Ocean' : undefined),
      enabled: true,
      extraSearchTerms: ['highlight', 'hero'],
    },
    {
      command: 'blockquote',
      title: 'Quote',
      description: 'Quote something, or someone.',
      icon: paintIcon(<Blockquote />, paint ? 'Ocean' : undefined),
      enabled: true,
      extraSearchTerms: ['>', 'quote', 'blockquote'],
    },
    {
      command: 'divider',
      title: 'Divider',
      description: 'A separator between your text',
      icon: paintIcon(<Divider />, paint ? 'Ocean' : undefined),
      enabled: true,
      extraSearchTerms: ['hr', 'divider', '-'],
    },
    {
      command: 'sketch',
      title: 'Sketch',
      icon: paintIcon(<Sketch />, paint ? 'Ocean' : undefined),
      description: 'Express yourself with a drawing',
      enabled: true,
      extraSearchTerms: ['draw', 'paint'],
    },
  ],
});

// add a group for more frequent ones?
const groups = (paint: boolean) => [
  mostFrequentlyUsedGroup(paint),
  modelGroup(paint),
  integrationsGroups(paint),
  widgetGroup(paint),
  visualisationGroup(paint),
  writingGroup(paint),
];

type SlashCommandsMenuProps = Pick<
  ComponentProps<typeof InlineMenu>,
  'onExecute' | 'search' | 'variant'
> & {
  readonly colorize?: boolean;
};

export const SlashCommandsMenu: FC<SlashCommandsMenuProps> = (props) => {
  // It's a function because feature flags can change for each test.
  const menuGroups = useMemo(() => groups(false), []);
  return <InlineMenu {...props} groups={menuGroups} />;
};
