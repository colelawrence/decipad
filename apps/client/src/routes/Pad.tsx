import { QueryHookOptions, useQuery } from '@apollo/client';
import { Editor } from '@decipad/editor';
import {
  GetPadById,
  GetPadByIdVariables,
  GET_PAD_BY_ID,
} from '@decipad/queries';
import { LoadingSpinnerPage } from '@decipad/ui';
import styled from '@emotion/styled';
import { FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

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
}

export const Pad = ({ workspaceId, padId }: PadProps) => {
  const { data, loading, error } = useGetPadByIdQuery({
    variables: { id: padId },
  });

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
            <Editor padId={data.getPadById.id} autoFocus />
          )}
        </EditorInner>
      </EditorWrapper>
    </Wrapper>
  );
};
