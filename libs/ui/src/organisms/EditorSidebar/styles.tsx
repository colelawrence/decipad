import { css } from '@emotion/react';
import { cssVar, p12Medium, p14Medium } from '../../primitives';
import { deciOverflowYStyles } from '../../styles/scrollbars';
import { regularBorder } from '../Table/Table';

export const sidebarColumnStyles = css`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 16px;
`;

export const sidebarWrapperStyles = css(
  {
    position: 'relative',
    overflowX: 'hidden',
    width: 320,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 8px 16px 16px',
    backgroundColor: cssVar('backgroundMain'),
  },
  deciOverflowYStyles
);

export const sidebarContentStyles = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 16,
  width: 288,
});

export const sidebarPaddingStyles = css`
  display: flex;
  width: 284px;
  padding: 8px 12px;
  justify-content: space-between;
  align-items: center;
`;

export const sidebarTitleFontStyles = css(p14Medium, { userSelect: 'none' });

export const sidebarTitleContainerStyles = css`
  text-transform: capitalize;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const sidebarTitleCountStyles = css(
  p12Medium,
  css`
    display: flex;
    padding: 2px 6px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    background: #ecf0f6;
  `
);

export const sidebarEllipsisStyles = css`
  display: flex;
  width: 20px;
  height: 20px;
  padding: 3px 1.5px;
  justify-content: center;
  align-items: center;
`;

export const sidebarSearchBoxStyles = css({
  display: 'flex',
  height: 32,
  padding: '6px 12px 6px 6px',
  alignItems: 'center',
  width: '100%',
  gap: 6,
  borderRadius: 6,
  border: regularBorder,
  backgroundColor: cssVar('backgroundMain'),
  color: cssVar('textSubdued'),
  input: {
    borderRadius: 0,
    border: 0,
    padding: 0,
    borderTop: regularBorder,
    borderBottom: regularBorder,
  },
  '.input-field-container': {
    width: '100%',
  },
});

export const sidebarSearchIconStyles = css({
  width: '20px',
  height: '20px',
  flexShrink: 0,
});
