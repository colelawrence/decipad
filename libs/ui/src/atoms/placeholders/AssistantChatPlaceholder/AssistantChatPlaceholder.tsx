/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { componentCssVars } from '../../../primitives';
import { FC } from 'react';

const wrapperStyles = css({
  position: 'relative',
  display: 'grid',
  overflow: 'hidden',
  gridTemplateRows: '44px auto 44px',
  height: '100%',
  width: '100%',
  backgroundColor: componentCssVars('AIAssistantBackgroundColor'),
  gap: 2,
});

export const headerStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0px 20px',
  width: '100%',
  height: 44,
  backgroundColor: componentCssVars('AIAssistantElevationColor'),
});

const listStyles = css({
  position: 'relative',
  overflowX: 'hidden',
  width: 640,
  height: '100%',
  display: 'flex',
  flexDirection: 'column-reverse',
  backgroundColor: componentCssVars('AIAssistantBackgroundColor'),
});

const inputStyles = css({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: 44,
  backgroundColor: componentCssVars('AIAssistantElevationColor'),
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
