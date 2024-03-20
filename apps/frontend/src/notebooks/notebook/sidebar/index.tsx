import { FC, Suspense } from 'react';
import {
  SidebarComponentsWithoutClosed,
  useNotebookMetaData,
} from '@decipad/react-contexts';
import { useActiveEditor } from '@decipad/editor-hooks';

import AssistantChat from './AssistantChat';
import EditorSidebar from './EditorSidebar';
import Publishing from './Publishing';
import Annotations from './Annotations';

import type { SidebarComponentProps } from './types';

type SidebarPropsWithoutEditor = Omit<SidebarComponentProps, 'editor'>;

const SidebarComponents: Record<
  SidebarComponentsWithoutClosed,
  FC<SidebarComponentProps>
> = {
  ai: AssistantChat,
  'default-sidebar': EditorSidebar,
  publishing: Publishing,
  annotations: Annotations,
};

/**
 * Renders the various components on the sidebar
 * Deciding which one to show to the user.
 */
const Sidebar: FC<SidebarPropsWithoutEditor> = (props) => {
  const [component] = useNotebookMetaData((s) => [s.sidebarComponent]);
  const editor = useActiveEditor(props.docsync);
  if (
    component === 'closed' ||
    editor == null ||
    (props.docsync?.isReadOnly && component !== 'annotations')
  ) {
    return null;
  }

  const SidebarComp = SidebarComponents[component];

  return (
    <>
      <Suspense>
        <SidebarComp {...props} editor={editor} />
      </Suspense>
    </>
  );
};

export default Sidebar;
