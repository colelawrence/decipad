import { NoDocSyncEditor } from '@decipad/editor';
import styled from '@emotion/styled';
import { wideBlockWidth } from 'libs/ui/src/styles/editor-layout';
import { FC, useEffect } from 'react';

const Wrapper = styled('div')({
  padding: '40px',
  margin: '0 auto',
});

const EditorWrapper = styled('div')({
  width: `min(100%, ${wideBlockWidth}px)`,
  margin: 'auto',
  marginTop: '100px',
  marginBottom: '200px',
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
