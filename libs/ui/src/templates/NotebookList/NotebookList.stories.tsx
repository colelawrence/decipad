import { Meta, StoryFn } from '@storybook/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
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

export const Normal: StoryFn<typeof args> = ({ numberOfNotebooks }) => (
  <DndProvider backend={HTML5Backend}>
    <NotebookList
      otherWorkspaces={[]}
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
          iconColor: 'Sulu',
          status: 'draft',
        }))}
    />
  </DndProvider>
);
