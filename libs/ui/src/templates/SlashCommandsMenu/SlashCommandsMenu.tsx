import { isFlagEnabled } from '@decipad/feature-flags';
import { ComponentProps, FC, useMemo } from 'react';
import {
  Blockquote,
  Calculations,
  Callout,
  Chart,
  CodeBlock,
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
} from '../../icons';
import { InlineMenu } from '../../organisms';

const dataItems = () => [
  {
    command: 'structured-input',
    title: 'Number Input',
    description: 'Create a number',
    icon: <Value />,
    enabled: isFlagEnabled('CODE_LINE_NAME_SEPARATED'),
    extraSearchTerms: ['john', 'number', 'input'],
  },
  {
    command: 'structured-code-line',
    title: 'Formula',
    description: 'Establish relationships between numbers using basic formulas',
    icon: <FormulaSlash />,
    enabled: isFlagEnabled('CODE_LINE_NAME_SEPARATED'),
    extraSearchTerms: ['formula', 'calculation'],
  },
  {
    command: 'calculation-block',
    title: 'Advanced formula',
    description: "Derive insights using Decipad's full language capabilities",
    icon: <Calculations />,
    enabled: true,
    extraSearchTerms: ['decipad', 'calculation', 'language', 'formula'],
  },
  {
    command: 'table',
    title: 'Table',
    description:
      'Organize data in a table. Input data into models using table format',
    icon: <TableSlash />,
    enabled: true,
    extraSearchTerms: [],
  },
];

const groups = () => [
  {
    title: 'Insert Data',
    items: dataItems(),
  },
  {
    title: 'Visualizations',
    items: [
      {
        command: 'data-view',
        title: 'Data view',
        description: 'Pivot table for data analysis, filtering, and grouping',
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
        command: 'plot',
        title: 'Chart',
        description: 'Visualize data with charts, plot data using charts',
        icon: <Chart />,
        enabled: true,
        extraSearchTerms: ['chart', 'visualisation', 'plot'],
      },
    ],
  },
  {
    title: 'Widgets',
    items: [
      {
        command: 'input',
        title: 'Input',
        description: 'Enter a value that others can interact with',
        icon: <Input />,
        enabled: true,
        extraSearchTerms: ['input', 'number', 'units', 'string'],
      },
      {
        command: 'toggle',
        title: 'Toggle',
        description: 'Choose between yes/no options using a switch',
        icon: <Toggle />,
        enabled: true,
        extraSearchTerms: ['switch', 'toggle', 'boolean', 'yes', 'no'],
      },
      {
        command: 'datepicker',
        title: 'Date',
        description: 'Pick a date from a calendar',
        icon: <DatePicker />,
        enabled: true,
        extraSearchTerms: ['input', 'date', 'calendar', 'pick'],
      },
      {
        command: 'slider',
        title: 'Slider',
        description: 'Slide to adjust a number and share it with others',
        icon: <Slider />,
        enabled: true,
        extraSearchTerms: ['input', 'number', 'slider', 'adjust'],
      },
      {
        command: 'display',
        title: 'Result',
        description: 'Highlight important results in a story',
        icon: <Result />,
        enabled: true,
        extraSearchTerms: ['display', 'result', 'show'],
      },
      {
        command: 'dropdown',
        title: 'Dropdown',
        description: 'Choose from a list of specified options',
        icon: <Dropdown />,
        enabled: true,
        extraSearchTerms: ['dropdown', 'list', 'select', 'options'],
      },
      {
        command: 'eval',
        title: 'Javascript',
        icon: <CodeBlock />,
        description: 'Allow users to run JavaScript code',
        enabled: isFlagEnabled('UNSAFE_JS_EVAL'),
        extraSearchTerms: ['eval', 'javascript', 'js', 'code', 'python'],
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
        extraSearchTerms: ['h1'],
      },
      {
        command: 'heading2',
        title: 'Sub-heading',
        description: 'Secondary text heading',
        icon: <Heading2 />,
        enabled: true,
        extraSearchTerms: ['h2'],
      },
      {
        command: 'callout',
        title: 'Callout',
        description: 'Grabs the readers attention',
        icon: <Callout />,
        enabled: true,
        extraSearchTerms: ['highlight', 'pop', 'hero'],
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
