import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { AvailableColorStatus, TColorStatus, UserIconKey } from '../../utils';
import { AvailableSwatchColor, swatchNames } from '../../utils/swatches';
import { NotebookListItem } from './NotebookListItem';

const args: Pick<
  ComponentProps<typeof NotebookListItem>,
  'name' | 'iconColor' | 'icon' | 'status'
> = {
  iconColor: 'Malibu' as AvailableSwatchColor,
  icon: 'Rocket' as UserIconKey,
  name: 'Getting started with Decipad',
  status: 'To Do' as TColorStatus,
};

export default {
  title: 'Organisms / UI / Notebook List / Item',
  component: NotebookListItem,
  argTypes: {
    iconColor: { options: swatchNames, control: { type: 'radio' } },
    status: { options: AvailableColorStatus, control: { type: 'radio' } },
    icon: {
      options: ['Rocket' as UserIconKey, 'Coffee' as UserIconKey],
      control: { type: 'radio' },
    },
  },
  decorators: [
    (St) => (
      <div style={{ margin: '5px' }}>
        <St />
      </div>
    ),
  ],
  args,
} as Meta<typeof args>;

export const Normal: Story<typeof args> = (props) => (
  <NotebookListItem {...props} id="nb" />
);
