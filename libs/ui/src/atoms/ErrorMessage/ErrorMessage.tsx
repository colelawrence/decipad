import { css } from '@emotion/react';
import { FC } from 'react';
import { cssVar, p16Medium, setCssVar } from '../../primitives';

const errorStyles = css(
  p16Medium,
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
