import { EditorSidebar as UIEditorSidebar } from '@decipad/editor-components';
import type { FC } from 'react';
import type { SidebarComponentProps } from './types';

const EditorSidebar: FC<SidebarComponentProps> = ({ editor }) => {
  return <UIEditorSidebar editor={editor} />;
};

export default EditorSidebar;
