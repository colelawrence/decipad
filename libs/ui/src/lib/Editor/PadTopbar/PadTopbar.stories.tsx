import { PadTopbar, PadTopbarProps } from './PadTopbar.component';

export default {
  title: 'Legacy / Templates / Pad / Topbar',
  component: PadTopbar,
  argTypes: { backArrowOnClick: { action: 'back button clicked' } },
};

export const Default = (args: PadTopbarProps) => <PadTopbar {...args} />;

Default.args = {
  userName: 'AE',
  notebookTitle: 'Use of funds',
};

Default.storyName = 'Topbar';
