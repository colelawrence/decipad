import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
} from '@chakra-ui/react';
import { Editor } from '@decipad/editor';
import {
  PermissionType,
  GetPadById,
  GetPadByIdVariables,
  GET_PAD_BY_ID,
  useSharePadWithEmail,
  useSharePadWithSecret,
} from '@decipad/queries';
import { LoadingSpinnerPage, organisms } from '@decipad/ui';
import styled from '@emotion/styled';
import { FC, useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import { getSecretPadLink } from '../lib/secret';

const Wrapper = styled('div')({
  padding: '16px 32px',
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

const TopBarWrapper = styled('div')({
  display: 'flex',
  width: '100%',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: '16px',
});

const EditorWrapper = styled('div')({
  position: 'relative',
});

const EditorInner = styled('div')({
  maxWidth: '120ch',
  margin: 'auto',
});

const useGetPadByIdQuery = (
  options: QueryHookOptions<GetPadById, GetPadByIdVariables>
) => useQuery<GetPadById, GetPadByIdVariables>(GET_PAD_BY_ID, options);

export interface PadProps {
  workspaceId: string;
  padId: string;
  // TODO make it so that only admins can share?
  enableShare?: boolean;
}

export const Pad = ({
  workspaceId,
  padId,
  enableShare = true,
}: PadProps): ReturnType<FC> => {
  const { search } = useLocation();
  const secret = new URLSearchParams(search).get('secret') ?? undefined;

  const { data, loading, error } = useGetPadByIdQuery({
    variables: { id: padId },
    // TODO share this with other queries, and the docsync authorization header
    context: secret
      ? { headers: { authorization: `Bearer ${secret}` } }
      : undefined,
  });
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [sharePadWithEmail] = useSharePadWithEmail();
  const [sharePadWithSecret, { loading: secretLoading }] =
    useSharePadWithSecret();
  const [shareSecret, setShareSecret] = useState<string>();

  if (loading) {
    return <LoadingSpinnerPage />;
  }

  if (error) {
    return (
      <ErrorWrapper>
        <ErrorHeader>Error loading pad: ${error.message}</ErrorHeader>
        <LinkButton to={`/workspaces/${workspaceId}`}>
          Back to workspace
        </LinkButton>
      </ErrorWrapper>
    );
  }

  return (
    <Wrapper>
      <TopBarWrapper>
        <LinkButton to={`/workspaces/${workspaceId}`}>
          <FiArrowLeft />
          Workspace
        </LinkButton>
        {enableShare && (
          <Button
            onClick={async () => {
              setShareMenuOpen(!shareMenuOpen);
              if (!shareSecret && !secretLoading) {
                const response = await sharePadWithSecret({
                  variables: {
                    id: padId,
                    permissionType: PermissionType.READ,
                    canComment: false,
                  },
                });
                if (response?.data?.sharePadWithSecret) {
                  setShareSecret(response.data.sharePadWithSecret);
                }
              }
            }}
          >
            Share
          </Button>
        )}
        {shareMenuOpen && (
          <Modal isOpen onClose={() => setShareMenuOpen(false)}>
            <ModalOverlay />
            <ModalBody>
              <ModalContent>
                <organisms.NotebookShareMenu
                  link={
                    shareSecret
                      ? getSecretPadLink(workspaceId, padId, shareSecret)
                      : 'Loading...'
                  }
                  onShareWithEmail={async (email, write) => {
                    await sharePadWithEmail({
                      variables: {
                        id: padId,
                        email,
                        permissionType: write
                          ? PermissionType.WRITE
                          : PermissionType.READ,
                        canComment: true,
                      },
                    });
                  }}
                />
              </ModalContent>
            </ModalBody>
          </Modal>
        )}
        <a
          href="https://www.notion.so/decipad/What-is-Deci-d140cc627f1e4380bb8be1855272f732"
          target="_blank"
          rel="noreferrer"
        >
          Documentation
        </a>
      </TopBarWrapper>
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
    </Wrapper>
  );
};
