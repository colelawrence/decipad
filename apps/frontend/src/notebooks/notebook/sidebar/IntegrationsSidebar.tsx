import type { FC } from 'react';
import { SidebarComponentProps } from './types';
import { Integrations } from '@decipad/editor-integrations';
import { useGetNotebookMetaQuery } from '@decipad/graphql-client';

const IntegrationsSidebar: FC<SidebarComponentProps> = ({
  notebookId,
  editor,
}) => {
  const [meta] = useGetNotebookMetaQuery({
    variables: { id: notebookId },
  });

  const workspaceId = meta.data?.getPadById?.workspace?.id;
  if (workspaceId == null) {
    return <>Sorry, you cannot use integrations right now.</>;
  }

  return <Integrations workspaceId={workspaceId} editor={editor} />;
};

export default IntegrationsSidebar;
