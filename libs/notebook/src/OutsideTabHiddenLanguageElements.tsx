import type { FC } from 'react';
import { useRef } from 'react';
import type {
  ElementKind,
  MyEditor,
  MyNode,
  PlateComponent,
  TabElement,
  DataTabWorkspaceResultElement,
} from '@decipad/editor-types';
import {
  ELEMENT_DATA_TAB_WORKSPACE_RESULT,
  ELEMENT_INTEGRATION,
  ELEMENT_LIVE_CONNECTION,
  ELEMENT_LIVE_DATASET,
  ELEMENT_TAB,
  ELEMENT_VARIABLE_DEF,
} from '@decipad/editor-types';
import { css } from '@emotion/react';
import type { PlateEditor } from '@udecode/plate-common';
import { Plate, getPlugin, isElement } from '@udecode/plate-common';
import { ErrorBoundary } from '@sentry/react';
import { WorkspaceNumber } from './WorkspaceNumber';
import { EditorController } from '@decipad/notebook-tabs';
import { Editable, ReactEditor, Slate } from 'slate-react';
import { BaseEditor } from 'slate';

export interface OutsideTabHiddenLanguageElementsProps {
  controller: EditorController;
  tabId?: string;
}

const needsRenderingLanguageElementTypes: Set<ElementKind> = new Set([
  ELEMENT_LIVE_CONNECTION,
  ELEMENT_LIVE_DATASET,
  ELEMENT_INTEGRATION,
  ELEMENT_VARIABLE_DEF,
]);

const outsideTabContainerStyles = css({ display: 'none' });

const RenderElement: FC<{ element: MyNode; editor: MyEditor }> = ({
  editor,
  element,
}) => {
  const ref = useRef(element);
  if (isElement(element)) {
    const plugin = getPlugin(editor as unknown as PlateEditor, element.type);
    if (plugin?.isElement && plugin.component) {
      const Component = plugin.component as PlateComponent;
      return (
        <Component
          key={element.id as string}
          attributes={{ 'data-slate-node': 'element', ref }}
          element={element}
        >
          {element.children.map((child) => (
            <RenderElement editor={editor} element={child} />
          ))}
        </Component>
      );
    }
  }
  return null;
};

const DataTabElements: FC<{
  controller: EditorController;
}> = ({ controller }) => {
  return (
    <Slate
      initialValue={controller.dataTabEditor.children}
      editor={controller.dataTabEditor as BaseEditor & ReactEditor}
    >
      <Editable
        renderElement={({ element, attributes, children }) => {
          if (
            'type' in element &&
            element.type !== ELEMENT_DATA_TAB_WORKSPACE_RESULT
          ) {
            return <div {...attributes}>{children}</div>;
          }
          return (
            <div {...attributes}>
              <WorkspaceNumber
                workspaceNumberElement={
                  element as DataTabWorkspaceResultElement
                }
              >
                {children}
              </WorkspaceNumber>
            </div>
          );
        }}
      />
    </Slate>
  );
};

const TabElements: FC<{
  tab: TabElement;
  editor: MyEditor;
}> = ({ tab, editor }) => {
  return (
    <>
      {tab.children
        .filter((child) => needsRenderingLanguageElementTypes.has(child.type))
        .map((element) => {
          return (
            <ErrorBoundary key={element.id}>
              <Plate editor={editor as unknown as PlateEditor}>
                <RenderElement editor={editor} element={element} />
              </Plate>
            </ErrorBoundary>
          );
        })}
    </>
  );
};

export const OutsideTabHiddenLanguageElements: FC<
  OutsideTabHiddenLanguageElementsProps
> = ({ controller, tabId: _tabId }) => {
  const tabId = _tabId ?? controller.children[1]?.id;
  if (!tabId) {
    return null;
  }

  const otherTabs = controller.children.filter((c) => c.id !== tabId);

  return (
    <div css={outsideTabContainerStyles}>
      <DataTabElements controller={controller} />
      {otherTabs.map(
        (tab) =>
          tab.type === ELEMENT_TAB && (
            <TabElements
              key={tab.id}
              editor={controller.getTabEditor(tabId)}
              tab={tab}
            />
          )
      )}
    </div>
  );
};
