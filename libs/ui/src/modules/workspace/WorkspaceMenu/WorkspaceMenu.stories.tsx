import { Meta, StoryFn } from '@storybook/react';
import { WorkspaceMenu } from './WorkspaceMenu';
import { noop } from '@decipad/utils';

export default {
  title: 'Organisms / UI / Workspace / Menu',
  component: WorkspaceMenu,
} as Meta;

export const Normal: StoryFn = () => (
  <WorkspaceMenu
    workspaces={[
      {
        id: '42',
        membersCount: 2,
        name: 'Some Workspace',
        isSelected: true,
        sections: [],
      },
      {
        id: '1337',
        membersCount: 2,
        name: 'Some Other Workspace',
        isSelected: false,
        sections: [],
      },
    ]}
    onCreateWorkspace={noop}
    onSelectWorkspace={noop}
  />
);
