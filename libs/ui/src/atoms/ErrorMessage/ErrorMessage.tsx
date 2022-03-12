import { FC } from 'react';
import { css } from '@emotion/react';
import { p16Bold, red500, setCssVar } from '../../primitives';

const errorStyles = css(p16Bold, setCssVar('currentTextColor', red500.rgb));

export const ErrorMessage = ({
  message,
}: {
  message: string;
}): ReturnType<FC> => <p css={errorStyles}>{message}</p>;
