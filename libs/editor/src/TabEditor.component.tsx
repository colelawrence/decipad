import { ComponentProps, FC, useMemo } from 'react';
import { Editor } from './Editor.component';
import { useRouteParams } from 'typesafe-routes/react-router';
import { notebooks } from '@decipad/routing';
import { EditorIdContext } from '@decipad/react-contexts';
import { TitleEditor } from './TitleEditor.component';
import { useUndo } from './hooks/useUndo';
import { Navigate } from 'react-router-dom';
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
  const {
    notebook,
    tab: tabId,
    embed,
  } = useRouteParams(notebooks({}).notebook);
  const tabs = useTabs();

  useUndo(controller);

  const tab = useMemo(
    () =>
      tabs.filter((t) => !readOnly || !t.isHidden).find((t) => t.id === tabId),
    [readOnly, tabId, tabs]
  );

  if (!tab && tabs.length > 0) {
    return (
      <Navigate
        to={notebooks({}).notebook({ notebook, tab: tabs[0].id, embed }).$}
      />
    );
  }

  if (!tab) {
    return <>Loading...</>;
  }

  const subEditor = controller.getTabEditor(tab.id);

  const titleEditor = controller.getTitleEditor();

  return (
    <EditorIdContext.Provider value={notebookId}>
      <Editor
        key={tab.id}
        notebookId={notebookId}
        workspaceId={workspaceId}
        readOnly={readOnly}
        loaded={loaded}
        editor={subEditor}
        tabIndex={tabs.findIndex((t) => t.id === tab.id)}
        titleEditor={
          <TitleEditor
            tab={tab.id}
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
