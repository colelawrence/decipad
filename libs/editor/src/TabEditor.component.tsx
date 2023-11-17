import { ComponentProps, FC } from 'react';
import { Editor } from './Editor.component';
import { useRouteParams } from 'typesafe-routes/react-router';
import { notebooks } from '@decipad/routing';
import { EditorIdContext } from '@decipad/react-contexts';
import { TitleEditor } from './TitleEditor.component';
import { useUndo } from './hooks/useUndo';
import { useNavigate } from 'react-router-dom';
import { MinimalRootEditorWithEventsAndTabsAndUndoAndTitleEditor } from '@decipad/editor-types';
import { useTabs } from '@decipad/editor-hooks';

type TabEditorComponentProps = Omit<
  ComponentProps<typeof Editor>,
  'editor' | 'tabIndex' | 'titleEditor'
> & {
  controller: MinimalRootEditorWithEventsAndTabsAndUndoAndTitleEditor;
};

/**
 * We should initialize all tab editors first of all.
 * and then render them instead of doing this here.
 */

export const TabEditorComponent: FC<TabEditorComponentProps> = ({
  controller,
  readOnly,
  notebookId,
  workspaceId,
  loaded,
}) => {
  const { notebook, tab, embed } = useRouteParams(notebooks({}).notebook);
  const tabs = useTabs();
  const nav = useNavigate();

  useUndo(controller);

  // our fallback tab is the first non hidden tab
  const defaultTabId = tabs.find((t) => !t.isHidden)?.id ?? tabs[0]?.id;

  // check if the tab was provided and exists
  const tabExists = !!tabs.find((t) => t.id === tab);

  // check if the tab was provided and is hidden
  const tabIsHidden = tabs.find((t) => t.id === tab)?.isHidden;

  // if we are in read mode and tab doesn't exist or is hidden, then we navigate to the first non hidden tab
  if (readOnly && (!tabExists || tabIsHidden)) {
    nav(notebooks({}).notebook({ notebook, tab: defaultTabId, embed }).$);
    return <>Loading...</>;
  }

  // leaving this until tabs reach production
  // selects 0 index tab if tab is not provided
  const tabEditorIndex = controller.getTabEditorIndex(
    tabExists ? tab : defaultTabId
  );

  if (tabEditorIndex === -1) {
    if (tab != null) {
      // We hit an edge case, where we have a link to a tab that was deleted.
      nav(notebooks({ notebook }).notebook({ notebook, embed }).$);
    }
    return <>Loading...</>;
  }

  const subEditor = controller.getTabEditorAt(tabEditorIndex);

  const titleEditor = controller.getTitleEditor();

  return (
    <EditorIdContext.Provider value={notebookId}>
      <Editor
        key={tab}
        notebookId={notebookId}
        workspaceId={workspaceId}
        readOnly={readOnly}
        loaded={loaded}
        editor={subEditor}
        tabIndex={tabEditorIndex}
        titleEditor={
          <TitleEditor
            tab={tab}
            editor={titleEditor}
            initialValue={titleEditor.children}
            readOnly={readOnly}
            onUndo={controller.undo}
            onRedo={controller.redo}
          />
        }
      />
    </EditorIdContext.Provider>
  );
};
