import { css } from '@emotion/react';
import { cssVar } from 'libs/ui/src/primitives';

export const searchFieldWithContainerStyles = css({
  display: 'flex',
  height: 32,
  padding: '6px 12px 6px 6px',
  alignItems: 'center',
  width: '100%',
  gap: 6,
  borderRadius: 6,
  border: `1px solid ${cssVar('borderSubdued')}`,
  backgroundColor: cssVar('backgroundMain'),
  color: cssVar('textSubdued'),
  'input, textarea': {
    borderRadius: 0,
    border: 0,
    padding: 0,
  },
  input: {
    borderTop: `1px solid ${cssVar('borderSubdued')}`,
    borderBottom: `1px solid ${cssVar('borderSubdued')}`,
  },
  '.input-field-container': {
    width: '100%',
  },
});

export const searchIconStyles = css({
  width: 16,
  height: 16,
  flexShrink: 0,
});
