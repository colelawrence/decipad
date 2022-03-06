import { useMutation, useQuery } from '@apollo/client';
import { ClientEventsContext } from '@decipad/client-events';
import { Editor } from '@decipad/editor';
import {
  DuplicatePad,
  DuplicatePadVariables,
  DUPLICATE_PAD,
  GetWorkspaces,
  GET_WORKSPACES,
  PermissionType,
  useSharePadWithSecret,
} from '@decipad/queries';
import { LoadingSpinnerPage, NotebookTopbar } from '@decipad/ui';
import styled from '@emotion/styled';
import Head from 'next/head';
import { FC, useContext, useEffect, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';
import { getSecretPadLink } from '../lib/secret';
import { useGetPadById } from '../queries/useGetPadById';

const Wrapper = styled('div')({
  display: 'grid',
  gridTemplate: `
    "topbar" auto
    "editor" 1fr
    /100%
  `,

  padding: '0 40px',
});

const EditorWrapper = styled('main')({
  gridArea: 'editor',
  position: 'relative',
  paddingBottom: '180px',
});
const EditorInner = styled('div')({
  maxWidth: '90ch',
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
  notebookId: string;
}

export const Notebook = ({ notebookId }: NotebookProps): ReturnType<FC> => {
  const history = useHistory();
  const { pathname, search } = useLocation();
  const { addToast } = useToasts();
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

  const { data: workspaces } = useQuery<GetWorkspaces>(GET_WORKSPACES);

  const [duplicatePad] =
    useMutation<DuplicatePad, DuplicatePadVariables>(DUPLICATE_PAD);
  const handleDuplicateNotebook = (id: string) =>
    duplicatePad({
      variables: {
        id,
        targetWorkspace: workspaces?.workspaces[0].id,
      },
      context: {
        headers: {
          authorization: `Bearer ${secret}`,
        },
      },
      refetchQueries: ['GetWorkspaceById'],
      awaitRefetchQueries: true,
    })
      .then(() => history.push(`/w/${workspaces?.workspaces[0].id}`))
      .catch((err) =>
        addToast(`Error duplicating notebook: ${err.message}`, {
          appearance: 'error',
        })
      );
  const clientEvent = useContext(ClientEventsContext);

  useEffect(() => {
    if (data && data.getPadById) {
      clientEvent({
        type: 'page',
        category: 'notebook',
        url: pathname,
        props: {
          title: data.getPadById.name,
        },
      });
    }
  }, [data, pathname, clientEvent]);

  if (loading) {
    return <LoadingSpinnerPage />;
  }

  const { getPadById } = data ?? {};
  const workspaceId = getPadById?.workspace.id;

  if (error || !data || !getPadById || !workspaceId) {
    return (
      <ErrorWrapper>
        <ErrorHeader>
          Error loading pad: {error?.message || 'Unknown Error'}
        </ErrorHeader>
        {workspaceId && (
          <LinkButton to={`/w/${workspaceId}`}>Back to workspace</LinkButton>
        )}
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
          <Editor
            padId={getPadById.id}
            readOnly={getPadById.myPermissionType === 'READ'}
            authSecret={secret}
          />
        </EditorInner>
      </EditorWrapper>
      <TopbarWrapper>
        <NotebookTopbar
          workspaceName={getPadById.workspace.name || ''}
          notebookName={getPadById.name || 'My notebook title'}
          workspaceHref={`/w/${workspaceId}`}
          usersWithAccess={getPadById.access.users ?? []}
          permission={getPadById.myPermissionType ?? undefined}
          link={
            shareSecret
              ? getSecretPadLink(notebookId, getPadById.name || '', shareSecret)
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
                      notebookId,
                      getPadById.name || '',
                      shareSecret ?? ''
                    ),
                  },
                });
              }
            }
          }}
          onDuplicateNotebook={async () => {
            await handleDuplicateNotebook(getPadById.id);
          }}
        />
      </TopbarWrapper>
    </Wrapper>
  );
};
