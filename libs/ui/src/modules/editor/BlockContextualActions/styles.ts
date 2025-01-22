import styled from '@emotion/styled';
import { cssVar } from 'libs/ui/src/primitives';

export const ContextualActionWrapper = styled.div<{ fullHeight?: boolean }>(
  ({ fullHeight }) => ({
    height: fullHeight ? '100%' : undefined,
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '8px',
  })
);

export const Button = styled.button({
  display: 'block',
  height: 20,
  width: 20,
  color: cssVar('textSubdued'),

  '&:hover, &:focus': {
    color: cssVar('textDefault'),
  },

  '&:active': {
    color: cssVar('textHeavy'),
  },
});
