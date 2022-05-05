import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { Rocket } from '../../icons';
import { NotebookIconButton } from './NotebookIconButton';

const args: ComponentProps<typeof NotebookIconButton> = {
  children: <Rocket />,
};

export default {
  title: 'Atoms / UI / Notebook Icon',
  component: NotebookIconButton,
  args,
  argTypes: {
    onClick: {
      action: 'clicked!',
    },
  },
} as Meta<typeof args>;

export const Normal: Story<typeof args> = (props) => (
  <NotebookIconButton {...props} />
);
