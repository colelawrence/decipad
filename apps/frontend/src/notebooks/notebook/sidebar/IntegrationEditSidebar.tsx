import type { FC } from 'react';
import { SidebarComponentProps } from './types';
import { EditIntegration } from '@decipad/editor-integrations';
import { useGetNotebookMetaQuery } from '@decipad/graphql-client';
import { useNotebookMetaData } from '@decipad/react-contexts';

const IntegrationEditSidebar: FC<SidebarComponentProps> = ({
  notebookId,
  editor,
}) => {
  const [meta] = useGetNotebookMetaQuery({
    variables: { id: notebookId },
  });

  const integrationBlockId = useNotebookMetaData((s) => s.integrationBlockId);

  const workspaceId = meta.data?.getPadById?.workspace?.id;
  if (workspaceId == null) {
    return <>Sorry, you cannot use integrations right now.</>;
  }

  if (integrationBlockId == null) {
    return (
      <>
        Sorry, but we don't know which integration you are editing, please
        contact support.
      </>
    );
  }

  return (
    <EditIntegration
      workspaceId={workspaceId}
      editor={editor}
      integrationBlockId={integrationBlockId}
    />
  );
};

export default IntegrationEditSidebar;
