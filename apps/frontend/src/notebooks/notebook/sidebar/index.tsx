import { useActiveEditor } from '@decipad/editor-hooks';
import type { SidebarComponentsWithoutClosed } from '@decipad/react-contexts';
import { useNotebookMetaData } from '@decipad/react-contexts';
import type { FC } from 'react';
import { Suspense } from 'react';

import Annotations from './Annotations';
import AssistantChat from './AssistantChat';
import EditorSidebar from './EditorSidebar';
import IntegrationEditSidebar from './IntegrationEditSidebar';
import IntegrationsSidebar from './IntegrationsSidebar';
import Publishing from './Publishing';

import type { SidebarComponentProps } from './types';
import { useNotebookWithIdState } from '@decipad/notebook-state';
import FormulaHelper from './FormulaHelper';

type SidebarPropsWithoutEditor = Omit<SidebarComponentProps, 'editor'>;

const SidebarComponents: Record<
  SidebarComponentsWithoutClosed['type'],
  FC<SidebarComponentProps>
> = {
  ai: AssistantChat,
  'default-sidebar': EditorSidebar,
  publishing: Publishing,
  annotations: Annotations,
  integrations: IntegrationsSidebar,
  'edit-integration': IntegrationEditSidebar,
  'formula-helper': FormulaHelper,
};

/**
 * Renders the various components on the sidebar
 * Deciding which one to show to the user.
 */
const Sidebar: FC<SidebarPropsWithoutEditor> = (props) => {
  const [component, setSidebar] = useNotebookMetaData((s) => [
    s.sidebarComponent,
    s.setSidebar,
  ]);

  const isAddingOrEditingVariable = useNotebookWithIdState(
    (s) => s.isAddingOrEditingVariable
  );

  const editor = useActiveEditor();
  if (
    component.type === 'closed' ||
    component.type === 'navigation-sidebar' ||
    editor == null
  ) {
    return null;
  }

  if (component.type === 'formula-helper' && !isAddingOrEditingVariable) {
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
