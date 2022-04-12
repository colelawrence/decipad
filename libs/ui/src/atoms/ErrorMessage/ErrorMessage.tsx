import { FC } from 'react';
import { css } from '@emotion/react';
import { cssVar, p16Bold, setCssVar } from '../../primitives';

const errorStyles = css(
  p16Bold,
  setCssVar('currentTextColor', cssVar('dangerColor'))
);

export const ErrorMessage = ({
  message,
}: {
  message: string;
}): ReturnType<FC> => <p css={errorStyles}>{message}</p>;
