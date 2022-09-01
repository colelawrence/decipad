import { isEnabled } from '@decipad/feature-flags';
import { ComponentProps, FC } from 'react';
import {
  Blockquote,
  Calculations,
  Callout,
  Chart,
  DatePicker,
  Divider,
  Heading1,
  Heading2,
  Input,
  Slider,
  TableSlash,
} from '../../icons';
import { InlineMenu } from '../../organisms';

const dataItems = [
  {
    command: 'calculation-block',
    title: 'Calculations',
    description: 'Use formulas to derive insight',
    icon: <Calculations />,
    enabled: true,
    extraSearchTerms: [
      'deci language',
      'calculation block',
      'language block',
      'model block',
    ],
  },
  {
    command: 'table',
    title: 'Table',
    description: 'Empty table to structure your data',
    icon: <TableSlash />,
    enabled: true,
    extraSearchTerms: [],
  },
  {
    command: 'data-view',
    title: 'Data View',
    description: 'Analyze, sort and group data using a table',
    icon: <TableSlash />,
    enabled: isEnabled('DATA_VIEW'),
    extraSearchTerms: ['group', 'sort', 'analyze'],
  },
  {
    command: 'plot',
    title: 'Chart',
    description: 'Chart some of your data',
    icon: <Chart />,
    enabled: true,
    extraSearchTerms: [],
  },
];

const jsEvalCmd = !isEnabled('UNSAFE_JS_EVAL')
  ? []
  : [
      {
        command: 'eval',
        title: 'Eval',
        icon: <Slider />,
        description: 'Let users to run unsafe code',
        enabled: true,
        extraSearchTerms: ['eval', 'fork-bomb', 'shit-bomb'],
      },
    ];

const groups = [
  {
    title: 'Numbers',
    items: dataItems,
  },
  {
    title: 'Widgets',
    items: [
      {
        command: 'input',
        title: 'Input',
        description: 'Share your notebook and have others interact with it',
        icon: <Input />,
        enabled: true,
        extraSearchTerms: ['input', 'number', 'publish'],
      },
      {
        command: 'datepicker',
        title: 'Date',
        description: 'Interact with your notebook using dates',
        icon: <DatePicker />,
        enabled: false,
        extraSearchTerms: ['input', 'date', 'calendar', 'publish'],
      },
      {
        command: 'slider',
        title: 'Slider',
        description: 'Let users interact with your notebook with a slider',
        icon: <Slider />,
        enabled: true,
        extraSearchTerms: ['input', 'number', 'slider', 'publish'],
      },
      ...jsEvalCmd,
    ],
  },
  {
    title: 'Text',
    items: [
      {
        command: 'heading1',
        title: 'Heading',
        description: 'Add main text heading',
        icon: <Heading1 />,
        enabled: true,
        extraSearchTerms: ['h1'],
      },
      {
        command: 'heading2',
        title: 'Sub-heading',
        description: 'Add secondary text heading',
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
    ],
  },
];

type SlashCommandsMenuProps = Pick<
  ComponentProps<typeof InlineMenu>,
  'onExecute' | 'search'
>;

export const SlashCommandsMenu: FC<SlashCommandsMenuProps> = (props) => {
  return <InlineMenu {...props} groups={groups} />;
};
