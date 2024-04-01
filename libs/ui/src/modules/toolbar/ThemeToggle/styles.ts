import styled from '@emotion/styled';
import { codeLog, cssVar } from 'libs/ui/src/primitives';

export const Toggle = styled.button(codeLog, {
  color: cssVar('textDefault'),
  cursor: 'pointer',

  '&:hover': {
    textDecoration: 'underline',
  },
});
