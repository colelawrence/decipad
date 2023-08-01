import styled from '@emotion/styled';
import { cssVar, p14Regular } from '../../primitives';

export const InvitationMessage = styled.p(p14Regular, {
  padding: '0 32px',
  textAlign: 'center',
  color: cssVar('textDisabled'),
});
