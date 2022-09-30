import { noop } from '@decipad/utils';
import { Meta, Story } from '@storybook/react';
import { StarterChecklist, StarterChecklistProps } from './StarterChecklist';

const args: StarterChecklistProps = {
  checklist: {
    items: [
      {
        id: 1,
        component: 'exp',
        text: 'Widget text',
        state: false,
        type: 'interaction',
      },
      {
        id: 2,
        component: 'p',
        text: 'Paragraph text',
        state: false,
        type: 'creation',
      },
      {
        id: 3,
        component: 'code_line',
        text: 'codeline text',
        state: false,
        type: 'creation',
      },
    ],
    completed: false,
    hidden: false,
  },
  onHideChecklist: noop,
};

export default {
  title: 'Organisms / Editor / Starter Checklist',
  component: StarterChecklist,
  args,
} as Meta;

export const Normal: Story<StarterChecklistProps> = (props) => (
  <StarterChecklist {...props} />
);
