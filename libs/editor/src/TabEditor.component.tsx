import { ComponentProps, FC } from 'react';
import { Editor } from './Editor.component';
import { EditorController } from '@decipad/notebook-tabs';
import { useRouteParams } from 'typesafe-routes/react-router';
import { notebooks } from '@decipad/routing';
import { EditorIdContext } from '@decipad/react-contexts';
import { TitleEditor } from './TitleEditor.component';

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
  const { tab } = useRouteParams(notebooks({}).notebook);

  const subEditorIndex =
    tab != null ? controller.SubEditors.findIndex((v) => v.id === tab) : 0;

  if (subEditorIndex === -1) {
    <>Loading...</>;
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
          />
        }
      />
    </EditorIdContext.Provider>
  );
};
