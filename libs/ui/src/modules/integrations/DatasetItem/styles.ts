import styled from '@emotion/styled';
import { cssVar, p14Medium } from 'libs/ui/src/primitives';

export const Wrapper = styled.div({
  display: 'flex',
  padding: '8px',
  alignItems: 'center',
  gap: '12px',

  width: '100%',
  borderRadius: '8px',
  border: `1px solid ${cssVar('borderSubdued')}`,
});

export const Icon = styled.div({
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
  width: '40px',
  height: '40px',
  backgroundColor: cssVar('iconBackground'),
  borderRadius: '8px',

  '& > svg': {
    width: '100%',
    height: '100%',
  },
});

export const Title = styled.div(p14Medium, {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: 2,

  p: {
    color: cssVar('textTitle'),
  },

  'p:last-child': {
    color: cssVar('textSubdued'),
  },
});

export const Actions = styled.div({
  display: 'flex',
});
