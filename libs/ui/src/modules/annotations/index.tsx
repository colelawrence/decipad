import { css } from '@emotion/react';

const containerStyles = css({
  width: 348,
  position: 'relative',
});

export const Annotations = () => {
  return <div css={containerStyles} id="annotations-container" />;
};
