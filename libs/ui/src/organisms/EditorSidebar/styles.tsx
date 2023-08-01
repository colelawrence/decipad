import { css } from '@emotion/react';
import {
  cssVar,
  p12Medium,
  p14Medium,
  shortAnimationDuration,
} from '../../primitives';
import { deciOverflowYStyles } from '../../styles/scrollbars';
import { regularBorder } from '../Table/Table';

export const sidebarWrapperStyles = css(
  {
    overflowX: 'hidden',
    width: 300,
    transition: `width ${shortAnimationDuration} ease-in-out, padding 0ms linear ${shortAnimationDuration}`,
    height: '100%',
    top: 66,
    right: 0,
    alignItems: 'center',
    padding: 14,
    backgroundColor: cssVar('backgroundMain'),
  },
  deciOverflowYStyles
);

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

export const sidebarColumnStyles = css`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 20px;
`;

export const sidebarSearchBoxStyles = css({
  display: 'flex',
  width: 264,
  height: 32,
  padding: '6px 12px 6px 6px',
  alignItems: 'center',
  gap: 10,
  borderRadius: 6,
  border: regularBorder,
  backgroundColor: cssVar('backgroundMain'),
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

export const sidebarSearchIconStyles = css`
  display: grid;
  width: 20px;
  height: 20px;
`;
