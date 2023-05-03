import { isFlagEnabled } from '@decipad/feature-flags';
import { ComponentProps, FC, useMemo } from 'react';
import {
  AreaChartSlash,
  BarChartSlash,
  Blockquote,
  Calculations,
  Callout,
  DataView,
  DatePicker,
  Divider,
  Dropdown,
  FormulaSlash,
  Value,
  Heading1,
  Heading2,
  Input,
  Result,
  Sketch,
  Slider,
  TableSlash,
  Toggle,
  PieChartSlash,
  ScatterPlotSlash,
  LineChartSlash,
} from '../../icons';
import { InlineMenu } from '../../organisms';

const dataItems = () => [
  {
    command: 'structured-input',
    title: 'Number Input',
    description: 'Create a number',
    icon: <Value />,
    enabled: isFlagEnabled('CODE_LINE_NAME_SEPARATED'),
    extraSearchTerms: ['number', 'input'],
  },
  {
    command: 'structured-code-line',
    title: 'Formula',
    description: 'Create a calculation',
    icon: <FormulaSlash />,
    enabled: isFlagEnabled('CODE_LINE_NAME_SEPARATED'),
    extraSearchTerms: ['formula', 'calculation'],
  },
  {
    command: 'calculation-block',
    title: 'Advanced formula',
    description: 'Combine formulas',
    icon: <Calculations />,
    enabled: true,
    extraSearchTerms: ['decipad', 'calculation', 'language', 'formula'],
  },
  {
    command: 'table',
    title: 'Table',
    description: 'Create a table to input data',
    icon: <TableSlash />,
    enabled: true,
    extraSearchTerms: [],
  },
  {
    command: 'data-mapping',
    title: 'Data Mapping',
    description: 'Map data into variables',
    icon: <TableSlash />,
    enabled: isFlagEnabled('DATA_MAPPINGS'),
    extraSearchTerms: [],
  },
  {
    command: 'live-query',
    title: 'Live Query',
    description: 'Query a database',
    icon: <TableSlash />,
    enabled: isFlagEnabled('LIVE_QUERY'),
    extraSearchTerms: ['sql', 'db', 'database'],
  },
];

const groups = () => [
  {
    title: 'Insert Data',
    items: dataItems(),
  },
  ...(isFlagEnabled('INTEGRATIONS_MODEL_DIALOG')
    ? [
        {
          title: 'Integrations',
          items: [
            {
              command: 'open-integration',
              title: 'Import External Data',
              description:
                'Take your existing data and bring it over to Deci seamlessly',
              icon: <DataView />,
              enabled: true,
              extraSearchTerms: [],
            },
          ],
        },
      ]
    : []),
  {
    title: 'Visualizations',
    items: [
      {
        command: 'data-view',
        title: 'Data view',
        description: 'Pivot table data',
        icon: <DataView />,
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
      },
      {
        command: 'pie-chart',
        title: 'Pie Chart',
        description: 'Visualize data on a pie chart',
        icon: <PieChartSlash />,
        enabled: true,
        extraSearchTerms: ['chart', 'visualisation', 'plot'],
      },
      {
        command: 'line-chart',
        title: 'Line Chart',
        description: 'Visualise data on a line chart',
        icon: <LineChartSlash />,
        enabled: true,
        extraSearchTerms: ['chart', 'visualisation', 'plot', 'line plot'],
      },
      {
        command: 'bar-chart',
        title: 'Bar Chart',
        description: 'Visualise dta on a bar chart',
        icon: <BarChartSlash />,
        enabled: true,
        extraSearchTerms: ['chart', 'visualisation', 'plot', 'bar plot'],
      },
      {
        command: 'area-chart',
        title: 'Area Chart',
        description: 'Visualize data on an area chart',
        icon: <AreaChartSlash />,
        enabled: true,
        extraSearchTerms: ['chart', 'visualisation', 'plot', 'area plot'],
      },
      {
        command: 'scatter-plot',
        title: 'Scatter Plot',
        description: 'Visualise data on a scatter plot',
        icon: <ScatterPlotSlash />,
        enabled: true,
        extraSearchTerms: ['point plot', 'chart', 'visualisation', 'plot'],
      },
    ],
  },
  {
    title: 'Widgets',
    items: [
      {
        command: 'input',
        title: 'Input',
        description: 'Define values others can update',
        icon: <Input />,
        enabled: true,
        extraSearchTerms: ['input'],
      },
      {
        command: 'toggle',
        title: 'Toggle',
        description: 'Define a switcher for booleans',
        icon: <Toggle />,
        enabled: true,
        extraSearchTerms: ['switch', 'toggle', 'boolean'],
      },
      {
        command: 'datepicker',
        title: 'Date',
        description: 'Define a data picker',
        icon: <DatePicker />,
        enabled: true,
        extraSearchTerms: ['input', 'date', 'calendar', 'pick'],
      },
      {
        command: 'slider',
        title: 'Slider',
        description: 'Define a slider others can update',
        icon: <Slider />,
        enabled: true,
        extraSearchTerms: ['input', 'slider'],
      },
      {
        command: 'display',
        title: 'Result',
        description: 'Highlight a result',
        icon: <Result />,
        enabled: true,
        extraSearchTerms: ['display', 'result', 'show'],
      },
      {
        command: 'dropdown',
        title: 'Dropdown',
        description: 'Define pre-selected options',
        icon: <Dropdown />,
        enabled: true,
        extraSearchTerms: ['dropdown', 'list', 'select', 'options'],
      },
    ],
  },
  {
    title: 'Writing',
    items: [
      {
        command: 'heading1',
        title: 'Heading',
        description: 'Main text heading',
        icon: <Heading1 />,
        enabled: true,
        extraSearchTerms: ['h1', '#'],
      },
      {
        command: 'heading2',
        title: 'Sub-heading',
        description: 'Secondary text heading',
        icon: <Heading2 />,
        enabled: true,
        extraSearchTerms: ['h2', '##'],
      },
      {
        command: 'callout',
        title: 'Callout',
        description: 'Grabs the readers attention',
        icon: <Callout />,
        enabled: true,
        extraSearchTerms: ['highlight', 'hero'],
      },
      {
        command: 'blockquote',
        title: 'Quote',
        description: 'Quote something, or someone.',
        icon: <Blockquote />,
        enabled: true,
        extraSearchTerms: ['>', 'quote', 'blockquote'],
      },
      {
        command: 'divider',
        title: 'Divider',
        description: 'A separator between your text',
        icon: <Divider />,
        enabled: true,
        extraSearchTerms: ['hr', 'divider', '-'],
      },
      {
        command: 'sketch',
        title: 'Sketch',
        icon: <Sketch />,
        description: 'Express yourself with a drawing',
        enabled: isFlagEnabled('SKETCH'),
        extraSearchTerms: ['draw', 'paint'],
      },
    ],
  },
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
