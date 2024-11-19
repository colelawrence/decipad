import type { FC } from 'react';
import { useEffect, useMemo } from 'react';
import type { DocSyncEditor } from '@decipad/docsync';
import { Notebook as NotebookEditor } from '@decipad/notebook';
import { useNotebookRoute } from '@decipad/routing';
import {
  EditorStylesContext,
  EditorStylesContextValue,
  ExternalDataSourcesContextProvider,
} from '@decipad/react-contexts';
import { EditorIcon, GlobalThemeStyles } from '@decipad/ui';
import { useNotebookStateAndActions } from './hooks';
import { useNotebookTitleChange, useSetWorkspaceQuota } from './Editor.helpers';
import { notebookErrorFactory } from './Errors';

export interface EditorProps {
  readonly notebookId: string;
  readonly docsync: DocSyncEditor | undefined;
}

/**
 * Entire Editor Wrapper.
 *
 * Responsible for loading all backend data it needs.
 */
const AppEditor: FC<EditorProps> = ({ notebookId, docsync }) => {
  const actions = useNotebookStateAndActions({
    notebookId,
    docsync,
  });

  useEffect(() => {
    if (actions.error) {
      throw notebookErrorFactory(actions.error.message);
    }
  }, [actions.error]);

  useSetWorkspaceQuota(actions.notebook?.workspace);

  const { onNotebookTitleChange } = useNotebookTitleChange(
    notebookId,
    actions.notebook?.name
  );
  const { isEmbed } = useNotebookRoute();

  //
  // Ugly hack.
  //
  // But Helmet doesn't work without side-effects.
  // I removed some re-renders from the top components and it stopped worked.
  //
  useEffect(() => {
    setTimeout(() => {
      if (actions.notebook?.name == null) {
        return;
      }

      document.title = `${actions.notebook.name} | Decipad`;
    }, 0);
  }, [actions.notebook?.name]);

  const editorStyles: EditorStylesContextValue = useMemo(
    () => ({
      color: actions.iconColor,
      numberFormatting: actions.numberFormatting ?? 'automatic',
    }),
    [actions.iconColor, actions.numberFormatting]
  );

  return (
    <ExternalDataSourcesContextProvider provider={actions.externalData}>
      <EditorStylesContext.Provider value={editorStyles}>
        <GlobalThemeStyles color={actions.iconColor} />
        {!isEmbed && (
          <EditorIcon
            icon={actions.icon ?? 'Deci'}
            color={actions.iconColor}
            onChangeIcon={actions.updateIcon}
            onChangeColor={actions.updateIconColor}
            readOnly={actions.isReadOnly}
          />
        )}
        <NotebookEditor
          secret={undefined}
          notebookId={notebookId}
          onNotebookTitleChange={onNotebookTitleChange}
          notebookMetaLoaded={actions.notebook != null}
          workspaceId={actions.notebook?.workspace?.id ?? ''}
          readOnly={actions.isReadOnly || isEmbed}
          connectionParams={actions.connectionParams}
          initialState={actions.initialState}
          getAttachmentForm={actions.getAttachmentForm}
          onAttached={actions.onAttached}
        />
      </EditorStylesContext.Provider>
    </ExternalDataSourcesContextProvider>
  );
};

export default AppEditor;
