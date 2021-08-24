import { css } from '@emotion/react';

export const wrapperStyles = css({
  background: 'white',
  boxShadow: '0px 2px 24px -4px rgba(36, 36, 41, 0.06)',
  borderRadius: '6px',
  border: '1px solid #f0f0f2',
  height: '48px',
  display: 'flex',
  alignItems: 'center',
  padding: '6px',
  position: 'absolute',
  left: '-9999px',
  top: '-9999px',
  opacity: 0,
  transition: 'opacity 0.2s ease-out',
});
