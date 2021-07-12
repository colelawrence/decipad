import React from 'react';
import { Editor } from '.';

export default {
  title: 'Editor',
  component: Editor,
};

export const Default = () => <Editor padId="test-pad-id-1" autoFocus />;
