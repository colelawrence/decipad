import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { UserIconKey } from '../../utils';
import { AvailableSwatchColor, swatchNames } from '../../utils/swatches';
import { NotebookListItem } from './NotebookListItem';

const args: Pick<
  ComponentProps<typeof NotebookListItem>,
  'name' | 'description' | 'iconColor' | 'icon'
> = {
  iconColor: 'Malibu' as AvailableSwatchColor,
  icon: 'Rocket' as UserIconKey,
  name: 'Getting started with Decipad',
  description:
    'Decipad is a low-code notebook that is easy and frictionless to use.',
};

export default {
  title: 'Organisms / Notebook List / Item',
  component: NotebookListItem,
  argTypes: {
    iconColor: { options: swatchNames, control: { type: 'radio' } },
    icon: {
      options: [
        'Rocket' as UserIconKey,
        'Coffee' as UserIconKey,
        'Sun' as UserIconKey,
      ],
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
  <NotebookListItem {...props} id="nb" exportFileName="" exportHref="" />
);
