import type { FC } from 'react';
import { useEffect, useMemo } from 'react';
import { useRouteParams } from 'typesafe-routes/react-router';
import type { Computer } from '@decipad/computer-interfaces';
import type { DocSyncEditor } from '@decipad/docsync';
import { Notebook as NotebookEditor } from '@decipad/notebook';
import { notebooks } from '@decipad/routing';
import {
  EditorStylesContext,
  ExternalDataSourcesContextProvider,
} from '@decipad/react-contexts';
import { EditorIcon, GlobalThemeStyles } from '@decipad/ui';
import { useNotebookStateAndActions } from './hooks';
import { useNotebookTitleChange, useSetWorkspaceQuota } from './Editor.helpers';
import { Frame } from '../../meta';

export interface EditorProps {
  readonly notebookId: string;
  readonly docsync: DocSyncEditor | undefined;
  readonly setDocsync: (docsync: DocSyncEditor) => void;
  readonly setComputer: (computer: Computer) => void;
  readonly setError: (error: Error | undefined) => void;
}

/**
 * Entire Editor Wrapper.
 *
 * Responsible for loading all backend data it needs.
 */
const AppEditor: FC<EditorProps> = ({
  notebookId,
  docsync,
  setDocsync,
  setComputer,
  setError,
}) => {
  const actions = useNotebookStateAndActions({
    notebookId,
    docsync,
  });

  useEffect(() => {
    if (actions.error) {
      setError(actions.error);
    }
  }, [actions.error, setError]);

  useSetWorkspaceQuota(actions.notebook?.workspace);

  const { onNotebookTitleChange } = useNotebookTitleChange(
    notebookId,
    actions.notebook?.name
  );
  const { embed: _embed } = useRouteParams(notebooks({}).notebook);
  const isEmbed = Boolean(_embed);

  const pageTitle = useMemo(() => actions.notebook?.name, [actions.notebook]);

  return (
    <Frame
      Heading="h1"
      suspenseFallback={null}
      title={pageTitle ?? 'New Notebook'}
    >
      <ExternalDataSourcesContextProvider provider={actions.externalData}>
        <EditorStylesContext.Provider value={{ color: actions.iconColor }}>
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
            onDocsync={setDocsync}
            onComputer={setComputer}
            notebookMetaLoaded={actions.notebook != null}
            workspaceId={actions.notebook?.workspace?.id ?? ''}
            readOnly={actions.isReadOnly}
            connectionParams={actions.connectionParams}
            initialState={actions.initialState}
            getAttachmentForm={actions.getAttachmentForm}
            onAttached={actions.onAttached}
          />
        </EditorStylesContext.Provider>
      </ExternalDataSourcesContextProvider>
    </Frame>
  );
};

export default AppEditor;
