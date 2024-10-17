import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { NotebookAvatars, NotebookAvatarsProps } from './NotebookAvatars';

const args: ComponentProps<typeof NotebookAvatars> = {
  invitedUsers: [
    {
      user: {
        id: '0',
        name: 'Doe John',
        email: 'dough@nar.com',
      },
      permission: 'WRITE',
      canComment: true,
    },
    {
      user: {
        id: '0',
        name: 'John Doe',
        email: 'foo@nar.com',
      },
      permission: 'ADMIN',
      canComment: true,
    },
  ],
};

export default {
  title: 'Molecules / UI / Notebook Top Bar / Users',
  component: NotebookAvatars,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (props: NotebookAvatarsProps) => (
  <NotebookAvatars {...props} />
);
