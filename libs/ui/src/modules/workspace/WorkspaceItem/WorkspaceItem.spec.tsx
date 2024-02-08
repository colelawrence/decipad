import { render, screen } from '@testing-library/react';
import { ComponentProps } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { WorkspaceItem } from './WorkspaceItem';
import { noop } from '@decipad/utils';

const props: ComponentProps<typeof WorkspaceItem> = {
  id: '42',
  name: 'Some Workspace',
  membersCount: 2,
  isActive: true,
  isPremium: false,
  onSelect: noop,
};

it('shows the workspace name', () => {
  render(
    <DndProvider backend={HTML5Backend}>
      <WorkspaceItem {...props} name="Some Workspace" />
    </DndProvider>
  );
  expect(screen.getByText('Some Workspace')).toBeVisible();
});

it('shows a workspace private if there is less than two members', () => {
  render(
    <DndProvider backend={HTML5Backend}>
      <WorkspaceItem {...props} membersCount={1} />
    </DndProvider>
  );
  expect(screen.getByText(`Private`)).toBeVisible();
});

it.each([
  [0, 'members'],
  [2, 'members'],
])('shows that there is/are %i member(s)', (membersCount, pluralization) => {
  render(
    <DndProvider backend={HTML5Backend}>
      <WorkspaceItem {...props} membersCount={membersCount} />
    </DndProvider>
  );
  expect(screen.getByText(`${membersCount} ${pluralization}`)).toBeVisible();
});
