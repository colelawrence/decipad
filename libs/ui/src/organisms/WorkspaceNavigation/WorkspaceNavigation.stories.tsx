import { noop } from '@decipad/utils';
import { Meta, Story } from '@storybook/react';
import { WorkspaceNavigation } from './WorkspaceNavigation';

export default {
  title: 'Organisms / UI / Workspace / Navigation',
  component: WorkspaceNavigation,
} as Meta;

export const Normal: Story = () => (
  <WorkspaceNavigation
    onDeleteSection={noop}
    onCreateSection={() => new Promise(noop)}
    onUpdateSection={() => new Promise(noop)}
    activeWorkspace={{ id: '42', sections: [] }}
  />
);
