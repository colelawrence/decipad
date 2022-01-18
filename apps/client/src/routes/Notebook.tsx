import { ClientEventsContext } from '@decipad/client-events';
import { Editor } from '@decipad/editor';
import { PermissionType, useSharePadWithSecret } from '@decipad/queries';
import { LoadingSpinnerPage, NotebookTopbar } from '@decipad/ui';
import styled from '@emotion/styled';
import Head from 'next/head';
import { FC, useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getSecretPadLink } from '../lib/secret';
import { useGetPadById } from '../queries/useGetPadById';

const Wrapper = styled('div')({
  display: 'grid',
  gridTemplate: `
    "topbar" auto
    "editor" 1fr
    /100%
  `,

  padding: '0 16px',
});

const EditorWrapper = styled('main')({
  gridArea: 'editor',
  position: 'relative',
});
const EditorInner = styled('div')({
  maxWidth: '120ch',
  margin: 'auto',
});

const TopbarWrapper = styled('header')({
  gridArea: 'topbar',
});

const ErrorWrapper = styled('div')({
  minHeight: '100vh',
  minWidth: '100vw',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

const ErrorHeader = styled('h1')({
  fontSize: '2rem',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
});

const LinkButton = styled(Link)({
  backgroundColor: '#111',
  color: '#fff',
  padding: '8px 16px',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
});

export interface NotebookProps {
  workspaceId: string;
  notebookId: string;
}

export const Notebook = ({
  workspaceId,
  notebookId,
}: NotebookProps): ReturnType<FC> => {
  const { search } = useLocation();
  const secret = new URLSearchParams(search).get('secret') ?? undefined;

  const { data, loading, error } = useGetPadById({
    variables: { id: notebookId },
    context: secret
      ? { headers: { authorization: `Bearer ${secret}` } }
      : undefined,
  });

  const [sharePadWithSecret, { loading: secretLoading }] =
    useSharePadWithSecret();
  const [shareSecret, setShareSecret] = useState<string>();

  const clientEvent = useContext(ClientEventsContext);

  if (loading) {
    return <LoadingSpinnerPage />;
  }

  if (error || !data) {
    return (
      <ErrorWrapper>
        <ErrorHeader>Error loading pad: ${error?.message}</ErrorHeader>
        <LinkButton to={`/workspaces/${workspaceId}`}>
          Back to workspace
        </LinkButton>
      </ErrorWrapper>
    );
  }

  return (
    <Wrapper>
      <Head>
        <title>{data.getPadById?.name} - Decipad</title>
      </Head>
      <EditorWrapper>
        <EditorInner>
          {data && data.getPadById && (
            <Editor
              padId={data.getPadById.id}
              readOnly={data.getPadById.myPermissionType === 'READ'}
              authSecret={secret}
              autoFocus
            />
          )}
        </EditorInner>
      </EditorWrapper>
      <TopbarWrapper>
        <NotebookTopbar
          workspaceName={data.getPadById?.workspace.name || ''}
          notebookName={data.getPadById?.name || '<unnamed notebook>'}
          workspaceHref={`/workspaces/${workspaceId}`}
          usersWithAccess={data.getPadById?.access.users || []}
          permission={data.getPadById?.myPermissionType}
          link={
            shareSecret
              ? getSecretPadLink(workspaceId, notebookId, shareSecret)
              : 'Loading...'
          }
          onToggleShare={async () => {
            if (!shareSecret && !secretLoading) {
              const response = await sharePadWithSecret({
                variables: {
                  id: notebookId,
                  permissionType: PermissionType.READ,
                  canComment: false,
                },
              });
              if (response?.data?.sharePadWithSecret) {
                setShareSecret(response.data.sharePadWithSecret);
                clientEvent({
                  type: 'action',
                  action: 'notebook shared',
                  props: {
                    url: getSecretPadLink(
                      workspaceId,
                      notebookId,
                      shareSecret ?? ''
                    ),
                  },
                });
              }
            }
          }}
        />
      </TopbarWrapper>
    </Wrapper>
  );
};
