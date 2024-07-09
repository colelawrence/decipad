import { css, keyframes } from '@emotion/react';
import { cssVar } from 'libs/ui/src/primitives';
import { sanitizeInput } from 'libs/ui/src/utils';
import React, { ReactNode } from 'react';

const loadingAnimation = keyframes`
  0% { background-color: ${cssVar('backgroundDefault')}; }
  50% { background-color: ${cssVar('backgroundHeavier')}; }
  100% { background-color: ${cssVar('backgroundDefault')}; }
`;

const placeholderAnimation = css`
  animation: ${loadingAnimation} 1.5s infinite;
  height: 100px;
  border-radius: 8px;
  background-color: ${cssVar('backgroundDefault')};
`;

export type ImageDisplayProps = {
  src?: string;
  alt: string;
  author?: ReactNode;
  trackUrl?: string;
  insertFromPreview: (url: string, trackerUrl?: string) => void;
};

export const ImageDisplay: React.FC<ImageDisplayProps> = ({
  src,
  alt,
  author,
  trackUrl,
  insertFromPreview,
}) => {
  const imageDisplayWrapperStyle = css({
    display: 'inline-block',
    width: '100%',
    breakInside: 'avoid-column',
    marginBottom: '10px',
    cursor: src ? 'pointer' : 'default',
    ':hover': {
      opacity: src ? 0.8 : 1,
    },
    img: {
      borderRadius: 8,
    },
  });

  const safeUrl = sanitizeInput({ input: src || '', isURL: true });

  return (
    <div
      css={imageDisplayWrapperStyle}
      onClick={() => src && insertFromPreview(src, trackUrl)}
    >
      {src ? (
        <>
          <img src={safeUrl} alt={alt} css={imageStyle} />
          <div css={authorWrapStyle}>{author || null}</div>
        </>
      ) : (
        <div css={placeholderAnimation} />
      )}
    </div>
  );
};

const authorWrapStyle = css({ marginTop: 4 });

const imageStyle = css({
  display: 'block',
  width: '100%',
  maxHeight: '100%',
  objectFit: 'cover',
});
