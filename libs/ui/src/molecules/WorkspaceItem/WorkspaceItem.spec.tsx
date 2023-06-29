import { render, screen } from '@testing-library/react';
import { ComponentProps } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { WorkspaceItem } from './WorkspaceItem';

const props: ComponentProps<typeof WorkspaceItem> = {
  id: '42',
  name: 'Some Workspace',
  membersCount: 2,
};

it('shows the workspace name', () => {
  render(
    <DndProvider backend={HTML5Backend}>
      <WorkspaceItem {...props} name="Some Workspace" />
    </DndProvider>
  );
  expect(screen.getByText('Some Workspace')).toBeVisible();
});

it('renders an avatar with the initial of the workspace', () => {
  render(
    <DndProvider backend={HTML5Backend}>
      <WorkspaceItem {...props} name="Some Workspace" />
    </DndProvider>
  );
  expect(screen.getByLabelText(/avatar/i)).toHaveTextContent(/^so$/i);
});

it.each([
  [0, 'members'],
  [1, 'member'],
  [2, 'members'],
])('shows that there is/are %i member(s)', (membersCount, pluralization) => {
  render(
    <DndProvider backend={HTML5Backend}>
      <WorkspaceItem {...props} membersCount={membersCount} />
    </DndProvider>
  );
  expect(screen.getByText(`${membersCount} ${pluralization}`)).toBeVisible();
});
