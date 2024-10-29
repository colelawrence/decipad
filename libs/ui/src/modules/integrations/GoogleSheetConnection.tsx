import styled from '@emotion/styled';
import { FC, ReactNode } from 'react';
import { cssVar, p13Medium } from '../../primitives';

type FCWithChild = FC<{ children: ReactNode }>;

export const UIGoogleSheetConnection: FCWithChild = ({ children }) => (
  <Styles.Main>{children}</Styles.Main>
);
// <p css={p13Bold}>Connect a Google Sheet to your notebook</p>

const Styles = {
  Main: styled.div({
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    p: {
      color: cssVar('textSubdued'),
      marginBottom: '1em',
      a: {
        marginInline: '0.2em',
      },
    },
    h3: {
      ...p13Medium,
      color: cssVar('textSubdued'),
    },
  }),
};
