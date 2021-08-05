import { Meta, Story } from '@storybook/react';
import { sidePadding } from '../../storybook-utils';
import { WorkspaceNavigation } from './WorkspaceNavigation';

export default {
  title: 'Organisms / Workspace Navigation',
  component: WorkspaceNavigation,
  decorators: [sidePadding(8)],
} as Meta;

export const Normal: Story = () => (
  <WorkspaceNavigation allNotebooksHref="" preferencesHref="" />
);
