import { Meta } from '@storybook/react';
import { PadTopbar, PadTopbarProps } from './PadTopbar.component';

export default {
  title: 'Legacy / Templates / Pad / Topbar',
  component: PadTopbar,
  argTypes: { backArrowOnClick: { action: 'back button clicked' } },
} as Meta;

export const Normal = (args: PadTopbarProps) => <PadTopbar {...args} />;

Normal.args = {
  userName: 'AE',
  notebookTitle: 'Use of funds',
};

Normal.storyName = 'Topbar';
