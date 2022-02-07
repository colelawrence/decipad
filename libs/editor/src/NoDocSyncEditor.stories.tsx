import { Meta, Story } from '@storybook/react';
import { NoDocSyncEditor } from './NoDocSyncEditor.component';

export default {
  title: 'Legacy/Editor/Examples',
  component: NoDocSyncEditor,
} as Meta;

export const Normal: Story = () => (
  <div style={{ maxWidth: '90ch', margin: '25px auto' }}>
    <NoDocSyncEditor />
  </div>
);

Normal.storyName = 'No Doc Sync';
