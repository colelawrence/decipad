import { cssVar } from '@decipad/ui';
import styled from '@emotion/styled';

export const Styles = {
  OuterWrapper: styled.div({
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  }),

  Wrapper: styled.div({
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  }),

  Trigger: styled.div({
    display: 'flex',
    justifyContent: 'space-between',
    borderRadius: '6px',
    height: '32px',
    border: `1px solid ${cssVar('borderSubdued')}`,
    padding: '8px',
    svg: { width: '16px', height: '16px' },
  }),

  Link: styled.span({
    ':hover': {
      textDecoration: 'underline',
    },
  }),
};
