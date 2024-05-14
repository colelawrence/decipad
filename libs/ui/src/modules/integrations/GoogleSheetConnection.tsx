import styled from '@emotion/styled';
import { FC, ReactNode } from 'react';
import { p13Bold } from '../../primitives';

type FCWithChild = FC<{ children: ReactNode }>;

export const UIGoogleSheetConnection: FCWithChild = ({ children }) => (
  <Styles.Main>
    <p css={p13Bold}>Connect a Google Sheet to your notebook</p>
    {children}
  </Styles.Main>
);

const Styles = {
  Main: styled.div({
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  }),
};
