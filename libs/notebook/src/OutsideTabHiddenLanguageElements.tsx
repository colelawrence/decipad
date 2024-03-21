import { FC, useRef } from 'react';
import { type DocSyncEditor } from '@decipad/docsync';
import {
  ELEMENT_DATA_VIEW,
  ELEMENT_INTEGRATION,
  ELEMENT_LIVE_CONNECTION,
  ELEMENT_LIVE_DATASET,
  ELEMENT_TAB,
  ELEMENT_VARIABLE_DEF,
  ElementKind,
  MyEditor,
  MyNode,
  PlateComponent,
  TabElement,
} from '@decipad/editor-types';
import { css } from '@emotion/react';
import {
  Plate,
  PlateEditor,
  getPlugin,
  isElement,
} from '@udecode/plate-common';
import { ErrorBoundary } from '@sentry/react';

export interface OutsideTabHiddenLanguageElementsProps {
  editor: DocSyncEditor;
  tabId?: string;
}

const needsRenderingLanguageElementTypes: Set<ElementKind> = new Set([
  ELEMENT_DATA_VIEW,
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
> = ({ editor, tabId: _tabId }) => {
  const tabId = _tabId || editor.children[1]?.id;
  if (!tabId) {
    return null;
  }
  const otherTabs = editor.children.filter((c) => c.id !== tabId);

  return (
    <div css={outsideTabContainerStyles}>
      {otherTabs.map((tab) =>
        tab.type === ELEMENT_TAB ? (
          <TabElements
            key={tab.id}
            editor={editor.getTabEditor(tabId)}
            tab={tab}
          />
        ) : null
      )}
    </div>
  );
};
