import React from 'react';
import { NoDocSyncEditor } from './NoDocSyncEditor.component';

export default {
  title: 'Editor/Examples',
  component: NoDocSyncEditor,
};

export const Default = () => (
  <div style={{ maxWidth: '1140px', margin: '25px auto' }}>
    <NoDocSyncEditor />
  </div>
);

Default.storyName = 'No Doc Sync';
