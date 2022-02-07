import { NoDocSyncEditor } from '@decipad/editor';
import styled from '@emotion/styled';
import { FC, useEffect } from 'react';

const Wrapper = styled('div')({
  padding: '32px',
  margin: '0 auto',
});

const EditorWrapper = styled('div')({
  maxWidth: '90ch',
  margin: '0 auto',
});

export function Playground(): ReturnType<FC> {
  useEffect(() => {
    return () => {
      localStorage.clear();
    };
  }, []);

  return (
    <Wrapper>
      <EditorWrapper>
        <NoDocSyncEditor />
      </EditorWrapper>
    </Wrapper>
  );
}
