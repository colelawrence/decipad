import { useActiveEditor } from '@decipad/editor-hooks';
import type { SidebarComponentsWithoutClosed } from '@decipad/react-contexts';
import { useNotebookMetaData } from '@decipad/react-contexts';
import type { FC } from 'react';
import { Suspense } from 'react';

import Annotations from './Annotations';
import AssistantChat from './AssistantChat';
import EditorSidebar from './EditorSidebar';
import IntegrationsSidebar from './IntegrationsSidebar';
import Publishing from './Publishing';

import type { SidebarComponentProps } from './types';
import { useNotebookWithIdState } from '@decipad/notebook-state';
import FormulaHelper from './FormulaHelper';

const SidebarComponents: Record<
  SidebarComponentsWithoutClosed['type'],
  FC<SidebarComponentProps>
> = {
  ai: AssistantChat,
  'default-sidebar': EditorSidebar,
  publishing: Publishing,
  annotations: Annotations,
  integrations: IntegrationsSidebar,
  'formula-helper': FormulaHelper,
};

/**
 * Renders the various components on the sidebar
 * Deciding which one to show to the user.
 */
const Sidebar: FC<Omit<SidebarComponentProps, 'editor'>> = (props) => {
  const [component, setSidebar] = useNotebookMetaData((s) => [
    s.sidebarComponent,
    s.setSidebar,
  ]);

  const dataDrawerMode = useNotebookWithIdState((s) => s.dataDrawerMode);

  const editor = useActiveEditor();

  if (
    component.type === 'closed' ||
    component.type === 'navigation-sidebar' ||
    editor == null
  ) {
    return null;
  }

  if (
    component.type === 'formula-helper' &&
    dataDrawerMode.type !== 'edit' &&
    dataDrawerMode.type !== 'create'
  ) {
    setSidebar({ type: 'closed' });
  }

  const SidebarComp = SidebarComponents[component.type];

  return (
    <>
      <Suspense>
        <SidebarComp {...props} editor={editor} />
      </Suspense>
    </>
  );
};

export default Sidebar;
