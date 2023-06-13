import { noop } from '@decipad/utils';
import { Meta, StoryFn } from '@storybook/react';
import { WorkspaceNavigation } from './WorkspaceNavigation';

export default {
  title: 'Organisms / UI / Workspace / Navigation',
  component: WorkspaceNavigation,
} as Meta;

export const Normal: StoryFn = () => (
  <WorkspaceNavigation
    onDeleteSection={noop}
    onCreateSection={() => new Promise(noop)}
    onUpdateSection={() => new Promise(noop)}
    activeWorkspace={{ id: '42', sections: [] }}
  />
);
