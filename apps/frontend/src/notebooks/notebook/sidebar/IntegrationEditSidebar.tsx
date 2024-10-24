import type { FC } from 'react';
import { useMemo } from 'react';
import { SidebarComponentProps } from './types';
import { useGetNotebookMetaQuery } from '@decipad/graphql-client';
import { useNotebookMetaData } from '@decipad/react-contexts';
import { useGlobalFindNode } from '@decipad/editor-hooks';
import { assert } from '@decipad/utils';
import { Integrations } from '@decipad/editor-integrations';
import { ELEMENT_INTEGRATION } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';

const IntegrationEditSidebar: FC<SidebarComponentProps> = ({ notebookId }) => {
  const [meta] = useGetNotebookMetaQuery({
    variables: { id: notebookId },
  });

  const [sidebar, popSidebar] = useNotebookMetaData((s) => [
    s.sidebarComponent,
    s.popSidebar,
  ]);

  const findNode = useGlobalFindNode();

  const integrationBlock = useMemo(() => {
    assert(findNode != null, 'unreachable. Find node is always defined here.');
    return findNode(
      (n) => n.id === (sidebar.type === 'integrations' && sidebar.blockId)
    );
  }, [sidebar, findNode]);

  const workspaceId = meta.data?.getPadById?.workspace?.id;
  if (workspaceId == null) {
    return <>Sorry, you cannot use integrations right now.</>;
  }

  if (
    integrationBlock == null ||
    integrationBlock.type !== ELEMENT_INTEGRATION
  ) {
    popSidebar();
    return null;
  }

  assertElementType(integrationBlock, ELEMENT_INTEGRATION);

  return (
    <Integrations
      type="edit"
      integrationBlock={integrationBlock}
      workspaceId={workspaceId}
      connectionType={integrationBlock.integrationType.type}
    />
  );
};

export default IntegrationEditSidebar;
