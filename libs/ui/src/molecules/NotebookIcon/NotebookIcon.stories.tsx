import { Meta, StoryFn } from '@storybook/react';
import { AvailableSwatchColor, TColorStatus, UserIconKey } from '../../utils';
import { NotebookIcon } from './NotebookIcon';

const args = {
  icon: 'Car' as UserIconKey,
  color: 'Malibu' as AvailableSwatchColor,
  status: 'draft' as TColorStatus,
};

export default {
  title: 'Molecules /  UI / Notebook Icon',
  component: NotebookIcon,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = () => <NotebookIcon {...args} />;
