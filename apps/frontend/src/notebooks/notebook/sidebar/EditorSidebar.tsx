import { EditorSidebar as UIEditorSidebar } from '@decipad/editor-components';
import { FC } from 'react';
import { SidebarComponentProps } from './types';

const EditorSidebar: FC<SidebarComponentProps> = ({ editor }) => {
  return <UIEditorSidebar editor={editor} />;
};

export default EditorSidebar;
