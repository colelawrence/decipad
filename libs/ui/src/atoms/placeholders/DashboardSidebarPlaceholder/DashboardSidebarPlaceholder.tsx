import React from 'react';
import { css } from '@emotion/react';
import { cssVar } from '../../../primitives';

const containerStyle = css({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  rowGap: '20px',
  padding: 'calc(8px + 0.625vmax) 24px 56px',
});

const avatarPlaceholderStyles = css({
  height: '24px',
  width: '24px',
  borderRadius: '8px',
  marginTop: '8px',
  marginBottom: '8px',
  backgroundColor: `${cssVar('highlightColor')}`,
});

const buttonPlaceholderStyles = css({
  height: '35.59px',
  borderRadius: '8px',
  backgroundColor: `${cssVar('highlightColor')}`,
});

export const DashboardSidebarPlaceholder: React.FC = () => (
  <div css={containerStyle}>
    <div css={avatarPlaceholderStyles} />
    <div css={buttonPlaceholderStyles} />
  </div>
);
