import { EditorSidebar as UIEditorSidebar } from '@decipad/editor-components';
import type { FC } from 'react';
import type { SidebarComponentProps } from './types';
import { EditorController } from '@decipad/notebook-tabs';

const EditorSidebar: FC<SidebarComponentProps> = (props) => {
  if (props.docsync == null) {
    return null;
  }

  return (
    <UIEditorSidebar
      {...props}
      controller={props.docsync as unknown as EditorController}
    />
  );
};

export default EditorSidebar;
