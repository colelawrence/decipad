import { FC, useEffect } from 'react';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { NoDocSyncEditor } from '@decipad/editor';
import { FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Wrapper = styled('div')({
  padding: '32px',
  boxSizing: 'border-box',
});

const TopBar = styled('div')({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const ButtonStyles = css({
  border: 'none',
  backgroundColor: '#111',
  color: '#fff',
  fontWeight: 'bold',
  padding: '6px 12px',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.5rem',
});

const HomeButton = styled(Link)(ButtonStyles);
const DocumentationButton = styled('a')(ButtonStyles);

const EditorWrapper = styled('div')({
  maxWidth: '120ch',
  margin: '0 auto',
  paddingTop: '16px',
});

export function Playground(): ReturnType<FC> {
  useEffect(() => {
    return () => {
      localStorage.clear();
    };
  }, []);

  return (
    <Wrapper>
      <TopBar>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <HomeButton to="/" aria-label="Go to home">
            <FiArrowLeft />
            Home
          </HomeButton>
          <h1>Deci Playground</h1>
        </div>
        <DocumentationButton href="/docs" target="_blank" rel="noreferrer">
          Documentation
        </DocumentationButton>
      </TopBar>
      <EditorWrapper>
        <NoDocSyncEditor />
      </EditorWrapper>
    </Wrapper>
  );
}
