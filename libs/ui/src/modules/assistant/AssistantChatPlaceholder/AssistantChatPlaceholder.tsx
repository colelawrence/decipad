/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { cssVar } from '../../../primitives';
import { FC } from 'react';

const wrapperStyles = css({
  position: 'relative',
  display: 'grid',
  overflow: 'hidden',
  gridTemplateRows: '36px auto max-content',
  height: '100%',
  width: '100%',
  padding: 16,
  borderRadius: '16px 0px 0px 16px',
  backgroundColor: cssVar('backgroundMain'),
});

export const headerStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '4px 8px',
  backgroundColor: cssVar('backgroundDefault'),
  borderRadius: 8,
});

const listStyles = css({
  position: 'relative',
  width: 608,
  height: '100%',
});

const inputStyles = css({
  display: 'relative',
  minHeight: 40,
  width: '100%',
  backgroundColor: cssVar('backgroundHeavy'),
  borderRadius: 8,
  alignItems: 'center',
  padding: '8px 12px 8px 16px',
});

export const AssistantChatPlaceholder = (): ReturnType<FC> => {
  return (
    <div css={wrapperStyles}>
      <div css={headerStyles} />
      <div css={listStyles} />
      <div css={inputStyles} />
    </div>
  );
};
