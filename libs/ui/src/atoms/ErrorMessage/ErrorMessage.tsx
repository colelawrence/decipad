import { css } from '@emotion/react';
import { FC } from 'react';
import { cssVar, p16Bold, setCssVar } from '../../primitives';

const errorStyles = css(
  p16Bold,
  setCssVar('currentTextColor', cssVar('errorColor'))
);

export const ErrorMessage = ({
  message,
}: {
  message: string;
}): ReturnType<FC> => (
  <p contentEditable={false} css={errorStyles}>
    {message}
  </p>
);
