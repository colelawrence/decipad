import { Meta, StoryFn } from '@storybook/react';
import { WorkspaceMenu } from './WorkspaceMenu';
import { noop } from '@decipad/utils';

export default {
  title: 'Organisms / UI / Workspace / Menu',
  component: WorkspaceMenu,
} as Meta;

export const Normal: StoryFn = () => (
  <WorkspaceMenu
    hasFreeWorkspaceSlot={true}
    getPlanTitle={() => 'bruh'}
    workspaces={[
      {
        id: '42',
        membersCount: 2,
        name: 'Some Workspace',
        sections: [],
      },
      {
        id: '1337',
        membersCount: 2,
        name: 'Some Other Workspace',
        sections: [],
      },
    ]}
    onCreateWorkspace={noop}
    onSelectWorkspace={noop}
  />
);
