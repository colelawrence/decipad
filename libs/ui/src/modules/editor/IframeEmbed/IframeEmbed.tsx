/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { sanitizeInput } from 'libs/ui/src/utils';
import { FC, ReactNode } from 'react';

export const iframeStyles = css({
  display: 'block',
  paddingLeft: '0',
  paddingRight: '0',
  width: '100%',
  maxWidth: '100%',
  cursor: 'pointer',
  objectFit: 'cover',
  borderRadius: 8,
  border: 0,
});

type IframeEmbedComponent = {
  children: ReactNode;
  url: string;
};

export const IframeEmbed: FC<IframeEmbedComponent> = ({ children, url }) => {
  const safeUrl = sanitizeInput({ input: url, isURL: true });

  return (
    <IFrameContainerDiv>
      <ResponsiveIFrame
        title="decipad-embed"
        src={safeUrl}
        allow="fullscreen"
        allowFullScreen
        width="100%"
        height="100%"
      />
      {children}
    </IFrameContainerDiv>
  );
};

const IFrameContainerDiv = styled.div({
  position: 'relative',
  overflow: 'hidden',
  width: '100%',
  paddingTop: '66.6%', // belzebu V"""V, 16/9 would be 56.25%
});

const ResponsiveIFrame = styled.iframe({
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  width: '100%',
  height: '100%',
});
