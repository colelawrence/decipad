import styled from '@emotion/styled';
import { code, codeLog, cssVar } from 'libs/ui/src/primitives';

export const Wrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: 12,
  borderRadius: 12,
  background: cssVar('backgroundMain'),
  border: `1px solid ${cssVar('borderSubdued')}`,
});

export const Trigger = styled.span(codeLog, {
  color: cssVar('textDefault'),
  cursor: 'pointer',

  '&:hover': {
    textDecoration: 'underline',
  },
});

export const ToggleLabel = styled.label(code, {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  color: cssVar('textDefault'),
});
