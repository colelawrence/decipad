import { isFlagEnabled } from '@decipad/feature-flags';
import { css } from '@emotion/react';
import { ComponentProps, FC, ReactNode, useMemo } from 'react';
import {
  AreaChartSlash,
  BarChartSlash,
  Blockquote,
  Calculations,
  Callout,
  ConnectRanges,
  ConnectTable,
  DataView,
  DatePicker,
  Divider,
  Dropdown,
  FormulaSlash,
  Heading1,
  Heading2,
  Image,
  ImportTable,
  Input,
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
import { cssVar, setCssVar } from '../../primitives';

type Theme = 'Ocean' | 'Mint' | 'Orange' | 'Wine' | 'Daffodil';

const paintIcon = (icon: ReactNode, theme: Theme): ReactNode => {
  const groupIcon = css({
    ...setCssVar('slashColorLight', cssVar(`slashColor${theme}Light`)),
    ...setCssVar('slashColorNormal', cssVar(`slashColor${theme}Normal`)),
    ...setCssVar('slashColorHeavy', cssVar(`slashColor${theme}Heavy`)),
  });
  return <span css={groupIcon}>{icon}</span>;
};

const integrationCmd = (paint: Theme) => ({
  command: 'open-integration',
  title: 'Integrations',
  description: 'Take your existing data and bring it over to Deci seamlessly',
  icon: paintIcon(<ConnectRanges />, paint),
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

const sliderCmd = (paint: Theme) => ({
  command: 'slider',
  title: 'Slider',
  description: 'Define a slider others can update',
  icon: paintIcon(<Slider />, paint),
  enabled: true,
  extraSearchTerms: ['input', 'slider'],
});

const pivotCmd = (paint: Theme) => ({
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

const structuredCmd = (paint: Theme) => ({
  command: 'structured-input',
  title: 'Number Input',
  description: 'Create a number',
  icon: paintIcon(<Value />, paint),
  enabled: isFlagEnabled('CODE_LINE_NAME_SEPARATED'),
  extraSearchTerms: ['number', 'input'],
});

const tableCmd = (paint: Theme) => ({
  command: 'table',
  title: 'Table',
  description: 'Create a table to input data',
  icon: paintIcon(<TableSlash />, paint),
  enabled: true,
  extraSearchTerms: [],
});

const dataItems = [
  structuredCmd('Orange'),
  {
    command: 'structured-code-line',
    title: 'Formula',
    description: 'Create a calculation',
    icon: paintIcon(<FormulaSlash />, 'Orange'),
    enabled: isFlagEnabled('CODE_LINE_NAME_SEPARATED'),
    extraSearchTerms: ['formula', 'calculation'],
  },
  tableCmd('Orange'),
  {
    command: 'calculation-block',
    title: 'Advanced formula',
    description: 'Combine formulas',
    icon: paintIcon(<Calculations />, 'Orange'),
    enabled: true,
    extraSearchTerms: ['decipad', 'calculation', 'language', 'formula'],
  },
  {
    command: 'data-mapping',
    title: 'Data Mapping',
    description: 'Map data into variables',
    icon: paintIcon(<ImportTable />, 'Orange'),
    enabled: isFlagEnabled('DATA_MAPPINGS'),
    extraSearchTerms: [],
  },
];

const modelGroup = {
  title: 'Model',
  items: dataItems,
};

const integrationsGroups = {
  title: 'Integrations',
  items: [
    integrationCmd('Daffodil'),
    {
      command: 'live-query',
      title: 'SQL',
      description: 'Query a SQL database',
      icon: paintIcon(<ConnectTable />, 'Daffodil'),
      enabled: isFlagEnabled('LIVE_QUERY'),
      extraSearchTerms: ['sql', 'db', 'database'],
    },
    {
      command: 'upload-csv',
      title: 'CSV',
      description: 'Upload an CSV file',
      icon: paintIcon(<ImportTable />, 'Daffodil'),
      enabled: isFlagEnabled('UPLOAD_CSV'),
      extraSearchTerms: ['upload', 'csv', 'data', 'excel'],
    },
  ],
};

const mostFrequentlyUsedGroup = {
  title: 'Most used',
  items: [
    sliderCmd('Mint'),
    structuredCmd('Orange'),
    tableCmd('Orange'),
    integrationCmd('Daffodil'),
    pivotCmd('Wine'),
  ],
};

const visualisationGroup = {
  title: 'Visualizations',
  items: [
    pivotCmd('Wine'),
    {
      command: 'pie-chart',
      title: 'Pie Chart',
      description: 'Visualize data on a pie chart',
      icon: paintIcon(<PieChartSlash />, 'Wine'),
      enabled: true,
      extraSearchTerms: ['chart', 'visualisation', 'plot'],
    },
    {
      command: 'line-chart',
      title: 'Line Chart',
      description: 'Visualise data on a line chart',
      icon: paintIcon(<LineChartSlash />, 'Wine'),
      enabled: true,
      extraSearchTerms: ['chart', 'visualisation', 'plot', 'line plot'],
    },
    {
      command: 'bar-chart',
      title: 'Bar Chart',
      description: 'Visualise dta on a bar chart',
      icon: paintIcon(<BarChartSlash />, 'Wine'),
      enabled: true,
      extraSearchTerms: ['chart', 'visualisation', 'plot', 'bar plot'],
    },
    {
      command: 'area-chart',
      title: 'Area Chart',
      description: 'Visualize data on an area chart',
      icon: paintIcon(<AreaChartSlash />, 'Wine'),
      enabled: true,
      extraSearchTerms: ['chart', 'visualisation', 'plot', 'area plot'],
    },
    {
      command: 'scatter-plot',
      title: 'Scatter Plot',
      description: 'Visualise data on a scatter plot',
      icon: paintIcon(<ScatterPlotSlash />, 'Wine'),
      enabled: true,
      extraSearchTerms: ['point plot', 'chart', 'visualisation', 'plot'],
    },
  ],
};

const widgetGroup = {
  title: 'Widgets',
  items: [
    {
      command: 'input',
      title: 'Input',
      description: 'Define values others can update',
      icon: paintIcon(<Input />, 'Mint'),
      enabled: true,
      extraSearchTerms: ['input'],
    },
    sliderCmd('Mint'),
    {
      command: 'dropdown',
      title: 'Dropdown',
      description: 'Define pre-selected options',
      icon: paintIcon(<Dropdown />, 'Mint'),
      enabled: true,
      extraSearchTerms: ['dropdown', 'list', 'select', 'options'],
    },
    {
      command: 'datepicker',
      title: 'Date',
      description: 'Define a data picker',
      icon: paintIcon(<DatePicker />, 'Mint'),
      enabled: true,
      extraSearchTerms: ['input', 'date', 'calendar', 'pick'],
    },
    {
      command: 'toggle',
      title: 'Toggle',
      description: 'Define a switcher for booleans',
      icon: paintIcon(<Toggle />, 'Mint'),
      enabled: true,
      extraSearchTerms: ['switch', 'toggle', 'boolean'],
    },
    {
      command: 'display',
      title: 'Result',
      description: 'Highlight a result',
      icon: paintIcon(<Result />, 'Mint'),
      enabled: true,
      extraSearchTerms: ['display', 'result', 'show'],
    },
  ],
};

const writingGroup = {
  title: 'Writing',
  items: [
    {
      command: 'heading1',
      title: 'Heading',
      description: 'Main text heading',
      icon: paintIcon(<Heading1 />, 'Ocean'),
      enabled: true,
      extraSearchTerms: ['h1', '#'],
    },
    {
      command: 'heading2',
      title: 'Sub-heading',
      description: 'Secondary text heading',
      icon: paintIcon(<Heading2 />, 'Ocean'),
      enabled: true,
      extraSearchTerms: ['h2', '##'],
    },
    {
      command: 'upload-image',
      title: 'Image',
      description: 'Upload an image',
      icon: paintIcon(<Image />, 'Ocean'),
      enabled: true,
      extraSearchTerms: ['upload', 'image', 'media'],
    },
    {
      command: 'callout',
      title: 'Callout',
      description: 'Grabs the readers attention',
      icon: paintIcon(<Callout />, 'Ocean'),
      enabled: true,
      extraSearchTerms: ['highlight', 'hero'],
    },
    {
      command: 'blockquote',
      title: 'Quote',
      description: 'Quote something, or someone.',
      icon: paintIcon(<Blockquote />, 'Ocean'),
      enabled: true,
      extraSearchTerms: ['>', 'quote', 'blockquote'],
    },
    {
      command: 'divider',
      title: 'Divider',
      description: 'A separator between your text',
      icon: paintIcon(<Divider />, 'Ocean'),
      enabled: true,
      extraSearchTerms: ['hr', 'divider', '-'],
    },
    {
      command: 'sketch',
      title: 'Sketch',
      icon: paintIcon(<Sketch />, 'Ocean'),
      description: 'Express yourself with a drawing',
      enabled: isFlagEnabled('SKETCH'),
      extraSearchTerms: ['draw', 'paint'],
    },
  ],
};

// add a group for more frequent ones?
const groups = () => [
  mostFrequentlyUsedGroup,
  modelGroup,
  integrationsGroups,
  widgetGroup,
  visualisationGroup,
  writingGroup,
];

type SlashCommandsMenuProps = Pick<
  ComponentProps<typeof InlineMenu>,
  'onExecute' | 'search'
>;

export const SlashCommandsMenu: FC<SlashCommandsMenuProps> = (props) => {
  // It's a function because feature flags can change for each test.
  const menuGroups = useMemo(() => groups(), []);
  return <InlineMenu {...props} groups={menuGroups} />;
};
