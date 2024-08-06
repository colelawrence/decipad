import type { FC } from 'react';
import { Suspense } from 'react';
import type { SidebarComponentsWithoutClosed } from '@decipad/react-contexts';
import { useNotebookMetaData } from '@decipad/react-contexts';
import { useActiveEditor } from '@decipad/editor-hooks';

import AssistantChat from './AssistantChat';
import EditorSidebar from './EditorSidebar';
import Publishing from './Publishing';
import Annotations from './Annotations';
import IntegrationsSidebar from './IntegrationsSidebar';
import IntegrationEditSidebar from './IntegrationEditSidebar';

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
  integrations: IntegrationsSidebar,
  'edit-integration': IntegrationEditSidebar,
};

/**
 * Renders the various components on the sidebar
 * Deciding which one to show to the user.
 */
const Sidebar: FC<SidebarPropsWithoutEditor> = (props) => {
  const component = useNotebookMetaData((s) => s.sidebarComponent);

  const editor = useActiveEditor();
  if (component === 'closed' || editor == null) {
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
