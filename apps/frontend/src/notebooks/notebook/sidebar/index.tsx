import { useActiveEditor } from '@decipad/editor-hooks';
import type { SidebarComponentsWithoutClosed } from '@decipad/react-contexts';
import { useNotebookMetaData } from '@decipad/react-contexts';
import type { FC } from 'react';
import { Suspense, useLayoutEffect, useRef } from 'react';

import Annotations from './Annotations';
import AssistantChat from './AssistantChat';
import EditorSidebar from './EditorSidebar';
import IntegrationEditSidebar from './IntegrationEditSidebar';
import IntegrationsSidebar from './IntegrationsSidebar';
import Publishing from './Publishing';

import type { SidebarComponentProps } from './types';
import { useNotebookWithIdState } from '@decipad/notebook-state';
import FormulaHelper from './FormulaHelper';
import { useFormattingTabForm } from '@decipad/editor-components';

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
const Sidebar: FC<
  Omit<SidebarComponentProps, 'editor' | 'formattingTabForm'>
> = (props) => {
  const [component, setSidebar] = useNotebookMetaData((s) => [
    s.sidebarComponent,
    s.setSidebar,
  ]);

  const isAddingOrEditingVariable = useNotebookWithIdState(
    (s) => s.isAddingOrEditingVariable
  );

  const editor = useActiveEditor();
  const formattingTabForm = useFormattingTabForm(editor);

  /**
   * If any sidebar is open and a node that has formatting controls becomes
   * selected, the sidebar switches to EditorSidebar and shows the format tab.
   */
  const hasFormattingTab = formattingTabForm !== null;
  const previousHasFormattingTab = useRef(hasFormattingTab);
  useLayoutEffect(() => {
    if (
      component.type !== 'closed' &&
      hasFormattingTab &&
      !previousHasFormattingTab.current
    ) {
      setSidebar({ type: 'default-sidebar', selectedTab: 'format' });
    }
    previousHasFormattingTab.current = hasFormattingTab;
  }, [hasFormattingTab, setSidebar, component.type]);

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
        <SidebarComp
          {...props}
          editor={editor}
          formattingTabForm={formattingTabForm}
        />
      </Suspense>
    </>
  );
};

export default Sidebar;
