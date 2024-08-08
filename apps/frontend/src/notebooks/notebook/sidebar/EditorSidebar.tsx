import { EditorSidebar as EditorComponentSidebar } from '@decipad/editor-components';
import { EditorController } from '@decipad/notebook-tabs';
import type { FC } from 'react';
import type { SidebarComponentProps } from './types';

const EditorSidebar: FC<SidebarComponentProps> = (props) => {
  if (props.docsync == null) {
    return null;
  }
  return (
    <EditorComponentSidebar
      {...props}
      controller={props.docsync as unknown as EditorController}
    />
  );
};

export default EditorSidebar;
