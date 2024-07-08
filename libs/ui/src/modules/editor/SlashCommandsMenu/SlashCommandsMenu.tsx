import { ComponentProps, FC, useMemo } from 'react';

import {
  CommandAdvancedFormula,
  CommandArea,
  CommandBar,
  CommandCallout,
  CommandDataMapping,
  CommandDataView,
  CommandDate,
  CommandDivider,
  CommandDropdown,
  CommandFormula,
  CommandFunnel,
  CommandH1,
  CommandH2,
  CommandImage,
  CommandInput,
  CommandIntegrations,
  CommandLine,
  CommandMixed,
  CommandNumber,
  CommandPie,
  CommandPlot,
  CommandQuote,
  CommandRadar,
  CommandResult,
  CommandSketch,
  CommandSlider,
  CommandSubmit,
  CommandTable,
  CommandToggle,
} from '../../../icons/command-icons';
import { InlineMenu } from '../InlineMenu/InlineMenu';

const integrationCmd = {
  command: 'open-integration',
  title: 'Integrations',
  description: 'Connect to existing data',
  icon: <CommandIntegrations />,
  enabled: true,
  extraSearchTerms: [
    'data',
    'import',
    'external',
    'sql',
    'web',
    'google sheets',
    'gsheets',
    'js',
    'javascript',
    'sheets',
    'integrations',
    'js',
    'notion',
    'javascript',
    'code',
  ],
};

const sliderCmd = {
  command: 'slider',
  title: 'Slider',
  description: 'Define a slider others can update',
  icon: <CommandSlider />,
  enabled: true,
  extraSearchTerms: ['input', 'slider'],
};

const pivotCmd = {
  command: 'data-view',
  title: 'Data view',
  description: 'Pivot table data',
  icon: <CommandDataView />,
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
};

const structuredCmd = {
  command: 'structured-input',
  title: 'Number Input',
  description: 'Create a number',
  icon: <CommandNumber />,
  enabled: true,
  extraSearchTerms: ['number', 'input'],
};

const tableCmd = {
  command: 'table',
  title: 'Table',
  description: 'Create a table to input data',
  icon: <CommandTable />,
  enabled: true,
  extraSearchTerms: [],
};

const dataItems = [
  structuredCmd,
  {
    command: 'structured-code-line',
    title: 'Formula',
    description: 'Create a calculation',
    icon: <CommandFormula />,
    enabled: true,
    extraSearchTerms: ['formula', 'calculation'],
  },
  tableCmd,
  {
    command: 'calculation-block',
    title: 'Advanced formula',
    description: 'Combine formulas',
    icon: <CommandAdvancedFormula />,
    enabled: true,
    extraSearchTerms: ['decipad', 'calculation', 'language', 'formula'],
  },
];

const modelGroup = {
  title: 'Model',
  items: dataItems,
};

const submitFormItems = [
  {
    command: 'submit-form',
    title: 'Submit form',
    description: 'Make document submittable to readers',
    icon: <CommandSubmit />,
    enabled: true,
    restrictToPlans: ['pro', 'personal', 'team'],
    extraSearchTerms: [
      'submit',
      'zappier',
      'form',
      'submission',
      'integration',
    ],
  },
];

const submitGroup = {
  title: 'Submit form',
  items: submitFormItems,
};

const integrationsGroups = {
  title: 'Integrations',
  items: [
    integrationCmd,
    {
      command: 'upload-embed',
      title: 'Embed',
      description: 'Embed content from a website',
      icon: <CommandDataMapping />,
      enabled: true,
      extraSearchTerms: ['import', 'embed'],
    },
  ],
};

const mostFrequentlyUsedGroup = {
  title: 'Most used',
  items: [sliderCmd, structuredCmd, tableCmd, integrationCmd, pivotCmd],
};

const visualisationGroup = {
  title: 'Visualizations',
  items: [
    pivotCmd,
    {
      command: 'line-chart',
      title: 'Line Chart',
      description: 'Visualise data on a line chart',
      icon: <CommandLine />,
      enabled: true,
      extraSearchTerms: ['chart', 'visualisation', 'line', 'line plot'],
    },
    {
      command: 'bar-chart',
      title: 'Bar Chart',
      description: 'Visualise data on a bar chart',
      icon: <CommandBar />,
      enabled: true,
      extraSearchTerms: ['chart', 'visualisation', 'bar', 'bar plot'],
    },
    {
      command: 'pie-chart',
      title: 'Pie Chart',
      description: 'Visualize data on a pie chart',
      icon: <CommandPie />,
      enabled: true,
      extraSearchTerms: ['chart', 'visualisation', 'pie', 'donut'],
    },
    {
      command: 'combo-chart',
      title: 'Combo Chart',
      description: 'Visualize data on a combo chart',
      icon: <CommandMixed />,
      enabled: true,
      extraSearchTerms: ['chart', 'visualisation', 'combo', 'bar', 'line'],
    },
    {
      command: 'area-chart',
      title: 'Area Chart',
      description: 'Visualize data on an area chart',
      icon: <CommandArea />,
      enabled: true,
      extraSearchTerms: ['chart', 'visualisation', 'area', 'area plot'],
    },
    {
      command: 'scatter-plot',
      title: 'Scatter Chart',
      description: 'Visualise data on a scatter chart',
      icon: <CommandPlot />,
      enabled: true,
      extraSearchTerms: ['scatter', 'chart', 'visualisation', 'point'],
    },
    {
      command: 'funnel-plot',
      title: 'Funnel Chart',
      description: 'Visualise data on a funnel chart',
      icon: <CommandFunnel />,
      enabled: true,
      extraSearchTerms: ['funnel', 'chart', 'visualisation', 'plot'],
    },
    {
      command: 'radar-plot',
      title: 'Radar Chart',
      description: 'Visualise data on a radar chart',
      icon: <CommandRadar />,
      enabled: true,
      extraSearchTerms: ['radar', 'chart', 'visualisation', 'plot'],
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
      icon: <CommandInput />,
      enabled: true,
      extraSearchTerms: ['input'],
    },
    sliderCmd,
    {
      command: 'dropdown',
      title: 'Dropdown',
      description: 'Define pre-selected options',
      icon: <CommandDropdown />,
      enabled: true,
      extraSearchTerms: ['dropdown', 'list', 'select', 'options'],
    },
    {
      command: 'datepicker',
      title: 'Date',
      description: 'Define a data picker',
      icon: <CommandDate />,
      enabled: true,
      extraSearchTerms: ['input', 'date', 'calendar', 'pick'],
    },
    {
      command: 'toggle',
      title: 'Toggle',
      description: 'Define a switcher for booleans',
      icon: <CommandToggle />,
      enabled: true,
      extraSearchTerms: ['switch', 'toggle', 'boolean'],
    },
    {
      command: 'display',
      title: 'Result',
      description: 'Highlight a result',
      icon: <CommandResult />,
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
      icon: <CommandH1 />,
      enabled: true,
      extraSearchTerms: ['h1', '#'],
    },
    {
      command: 'heading2',
      title: 'Sub-heading',
      description: 'Secondary text heading',
      icon: <CommandH2 />,
      enabled: true,
      extraSearchTerms: ['h2', '##'],
    },
    {
      command: 'upload-image',
      title: 'Image',
      description: 'Upload an image',
      icon: <CommandImage />,
      enabled: true,
      extraSearchTerms: ['upload', 'image', 'media', 'jpg', 'gif', 'png'],
    },
    {
      command: 'callout',
      title: 'Callout',
      description: 'Grabs the readers attention',
      icon: <CommandCallout />,
      enabled: true,
      extraSearchTerms: ['highlight', 'hero'],
    },
    {
      command: 'blockquote',
      title: 'Quote',
      description: 'Quote something, or someone.',
      icon: <CommandQuote />,
      enabled: true,
      extraSearchTerms: ['>', 'quote', 'blockquote'],
    },
    {
      command: 'divider',
      title: 'Divider',
      description: 'A separator between your text',
      icon: <CommandDivider />,
      enabled: true,
      extraSearchTerms: ['hr', 'divider', '-'],
    },
    {
      command: 'sketch',
      title: 'Sketch',
      icon: <CommandSketch />,
      description: 'Express yourself with a drawing',
      enabled: true,
      extraSearchTerms: ['draw', 'paint'],
    },
  ],
};

// add a group for more frequent ones?
const groups = [
  mostFrequentlyUsedGroup,
  modelGroup,
  integrationsGroups,
  submitGroup,
  widgetGroup,
  visualisationGroup,
  writingGroup,
];

type SlashCommandsMenuProps = Pick<
  ComponentProps<typeof InlineMenu>,
  'onExecute' | 'search' | 'variant'
> & {
  readonly colorize?: boolean;
};

export const SlashCommandsMenu: FC<SlashCommandsMenuProps> = (props) => {
  // It's a function because feature flags can change for each test.
  const menuGroups = useMemo(() => groups, []);
  return <InlineMenu {...props} groups={menuGroups} />;
};
