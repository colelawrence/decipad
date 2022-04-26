import { Meta, Story } from '@storybook/react';
import { NotebookList } from './NotebookList';

const args = {
  numberOfNotebooks: 3,
};

export default {
  title: 'Templates / Dashboard / Notebook List',
  component: NotebookList,
  args,
  argTypes: {
    numberOfNotebooks: {
      control: { min: 0 },
    },
  },
} as Meta;

export const Normal: Story<typeof args> = ({ numberOfNotebooks }) => (
  <NotebookList
    Heading="h1"
    notebooks={Array(numberOfNotebooks)
      .fill(null)
      .map((_, i) => ({
        id: String(i),
        href: '',
        exportFileName: '',
        exportHref: '',
        name: `Notebook ${i + 1}`,
        description: 'A really cool notebook',
        icon: 'Rocket',
        iconColor: 'Catskill',
      }))}
  />
);
