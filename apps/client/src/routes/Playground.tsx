import { AnonymousDocSyncProvider, Editor } from '@decipad/editor';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { nanoid } from 'nanoid';
import { FC, useEffect, useMemo } from 'react';
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
  const randomId = useMemo(() => nanoid(), []);

  useEffect(() => {
    return () => {
      localStorage.clear();
    };
  }, []);

  return (
    <AnonymousDocSyncProvider>
      <Wrapper>
        <TopBar>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <HomeButton to="/" aria-label="Go to home">
              <FiArrowLeft />
              Home
            </HomeButton>
            <h1>Deci Playground</h1>
          </div>
          <DocumentationButton
            href="https://www.notion.so/decipad/What-is-Deci-d140cc627f1e4380bb8be1855272f732"
            target="_blank"
            rel="noreferrer"
          >
            Documentation
          </DocumentationButton>
        </TopBar>
        <EditorWrapper>
          <Editor padId={randomId} readOnly={false} autoFocus />
        </EditorWrapper>
      </Wrapper>
    </AnonymousDocSyncProvider>
  );
}
