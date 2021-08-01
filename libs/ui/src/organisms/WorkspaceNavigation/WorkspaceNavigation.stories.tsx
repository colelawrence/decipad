import { Meta } from '@storybook/react';
import { WorkspaceNavigation } from './WorkspaceNavigation';

export default {
  title: 'Organisms / Workspace Navigation',
  component: WorkspaceNavigation,
  decorators: [(story) => <div style={{ padding: '0 8px' }}>{story()}</div>],
} as Meta;

export const Normal = () => (
  <WorkspaceNavigation allNotebooksHref="" preferencesHref="" />
);
