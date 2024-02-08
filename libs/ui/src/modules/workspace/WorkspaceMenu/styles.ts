import styled from '@emotion/styled';
import { deciOverflowYStyles } from '../../../styles/scrollbars';
import { cssVar, p14Medium, smallScreenQuery } from '../../../primitives';

export const MenuWrapper = styled.div(
  {
    backgroundColor: cssVar('backgroundMain'),
    borderRadius: 12,
    border: `1px solid ${cssVar('borderSubdued')}`,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxHeight: 480,
    width: '100%',
    minWidth: 256,
    padding: 8,

    [smallScreenQuery]: {
      padding: 0,
      border: 'none',
      borderRadius: 0,
    },
  },
  deciOverflowYStyles
);

export const MenuHeader = styled.p(p14Medium, {
  margin: 0,
  marginTop: 4,
  padding: '0 8px',
  color: cssVar('textSubdued'),
});

export const MenuNav = styled.nav({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  margin: 0,
  padding: 0,
});
