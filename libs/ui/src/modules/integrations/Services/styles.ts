import styled from '@emotion/styled';
import { cssVar, p15Medium } from '../../../primitives';

export const Wrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: '12px',
});

export const Title = styled.p(p15Medium, {
  marginTop: 12,
  color: cssVar('textHeavy'),
});
