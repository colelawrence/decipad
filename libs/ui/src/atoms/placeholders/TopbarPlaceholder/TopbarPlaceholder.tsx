import React from 'react';
import { css } from '@emotion/react';
import { cssVar } from '../../../primitives';

const containerStyle = css({
  width: '100%',
  display: 'flex',
  padding: '16px 0',
  borderBottom: '1px solid',
  borderColor: `${cssVar('highlightColor')}`,
  justifyContent: 'space-between',
});

const backButtonStyles = css({
  height: '32px',
  width: '32px',
  borderRadius: '32px',
  backgroundColor: `${cssVar('highlightColor')}`,
});

const rightPanel = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '16px',
  marginRight: '-1rem',
});

const avatarPlaceholderStyles = css({
  height: '24px',
  width: '24px',
  borderRadius: '24px',
  backgroundColor: `${cssVar('highlightColor')}`,
});

const shareButtonPlaceholderStyles = css({
  height: '33.68px',
  width: '64px',
  borderRadius: '6px',
  backgroundColor: `${cssVar('highlightColor')}`,
});

export const TopbarPlaceholder: React.FC = () => (
  <div css={containerStyle}>
    <div css={backButtonStyles} />
    <div css={rightPanel}>
      <div css={avatarPlaceholderStyles} />
      <div css={shareButtonPlaceholderStyles} />
    </div>
  </div>
);
