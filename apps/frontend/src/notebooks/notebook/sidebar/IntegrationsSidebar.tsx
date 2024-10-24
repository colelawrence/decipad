import { type FC } from 'react';
import { SidebarComponentProps } from './types';
import { Integrations } from '@decipad/editor-integrations';
import { useGetNotebookMetaQuery } from '@decipad/graphql-client';
import { useNotebookMetaData } from '@decipad/react-contexts';
import { assert } from '@decipad/utils';
import IntegrationEditSidebar from './IntegrationEditSidebar';

const IntegrationsSidebar: FC<SidebarComponentProps> = (props) => {
  const [meta] = useGetNotebookMetaQuery({
    variables: { id: props.notebookId },
  });

  const sidebar = useNotebookMetaData((s) => s.sidebarComponent);
  assert(sidebar.type === 'integrations');

  const workspaceId = meta.data?.getPadById?.workspace?.id;
  if (workspaceId == null) {
    return <>Sorry, you cannot use integrations right now.</>;
  }

  if (sidebar.blockId)
    return <IntegrationEditSidebar {...props} workspaceId={workspaceId} />;
  return <Integrations workspaceId={workspaceId} type="create" />;
};

export default IntegrationsSidebar;
