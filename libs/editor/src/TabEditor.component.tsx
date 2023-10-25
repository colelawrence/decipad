import { ComponentProps, FC } from 'react';
import { Editor } from './Editor.component';
import { EditorController } from '@decipad/notebook-tabs';
import { useRouteParams } from 'typesafe-routes/react-router';
import { notebooks } from '@decipad/routing';
import { EditorIdContext } from '@decipad/react-contexts';
import { TitleEditor } from './TitleEditor.component';
import { useUndo } from './hooks/useUndo';
import { useNavigate } from 'react-router-dom';

type TabEditorComponentProps = Omit<
  ComponentProps<typeof Editor>,
  'editor' | 'tabIndex' | 'titleEditor'
> & {
  controller: EditorController;
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
  const { notebook, tab } = useRouteParams(notebooks({}).notebook);
  const nav = useNavigate();

  useUndo(controller);

  const subEditorIndex =
    tab != null ? controller.SubEditors.findIndex((v) => v.id === tab) : 0;

  if (subEditorIndex === -1 || !controller.IsLoaded) {
    if (tab != null) {
      // We hit an edge case, where we have a link to a tab that was deleted.
      nav(notebooks({ notebook }).notebook({ notebook }).$);
    }
    return <>Loading...</>;
  }

  const subEditor = controller.SubEditors[subEditorIndex];

  return (
    <EditorIdContext.Provider value={notebookId}>
      <Editor
        key={tab}
        notebookId={notebookId}
        workspaceId={workspaceId}
        readOnly={readOnly}
        loaded={loaded}
        editor={subEditor}
        tabIndex={subEditorIndex}
        titleEditor={
          <TitleEditor
            tab={tab}
            editor={controller.TitleEditor}
            initialValue={controller.TitleEditor.children}
            readOnly={readOnly}
            onUndo={controller.Undo}
            onRedo={controller.Redo}
          />
        }
      />
    </EditorIdContext.Provider>
  );
};
