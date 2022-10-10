import { noop } from '@decipad/utils';
import { Meta, Story } from '@storybook/react';
import { StarterChecklist, StarterChecklistProps } from './StarterChecklist';

const args: StarterChecklistProps = {
  checklist: {
    items: [
      {
        component: 'exp',
        text: 'Share this notebook',
        state: false,
        type: 'interaction',
      },
      {
        component: 'p',
        text: 'Edit the calculation',
        state: false,
        type: 'creation',
      },
      {
        component: 'code_line',
        text: 'Create your first calculation',
        state: false,
        type: 'creation',
      },
    ],
    confettiUsed: false,
    onStateChange: () => {},
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
