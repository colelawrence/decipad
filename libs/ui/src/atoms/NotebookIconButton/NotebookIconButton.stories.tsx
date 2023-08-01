import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { Rocket } from '../../icons';
import { NotebookIconButton } from './NotebookIconButton';

const args: ComponentProps<typeof NotebookIconButton> = {
  children: <Rocket />,
  isDefaultBackground: false,
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

export const Normal: StoryFn<typeof args> = (props) => (
  <NotebookIconButton {...props} />
);
