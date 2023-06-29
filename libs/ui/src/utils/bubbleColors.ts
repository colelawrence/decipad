import { css } from '@emotion/react';
import {
  cssVar,
  dark200,
  dark400,
  dark600,
  dark700,
  teal100,
  teal200,
  teal600,
  teal800,
} from '../primitives';
import { AvailableSwatchColor, bubblesThemed } from './swatches';

interface bubbleColorsProps {
  readonly color: AvailableSwatchColor;
  readonly isDarkTheme: boolean;
  readonly variant?: 'normal' | 'highlighted';
}

export const bubbleColors = ({
  color,
  isDarkTheme,
  variant = 'normal',
}: bubbleColorsProps) => {
  const baseSwatches = bubblesThemed(isDarkTheme, variant);
  const fallbackBgColor = cssVar('strongHighlightColor');
  const fallbackColor = cssVar('strongTextColor');
  const bubbleBgColor =
    color && color !== 'Catskill'
      ? baseSwatches[color].backgroundColor
      : isDarkTheme
      ? variant === 'normal'
        ? dark600
        : dark700
      : variant === 'normal'
      ? teal100
      : teal200;
  const bubbleColor =
    color && color !== 'Catskill'
      ? baseSwatches[color].color
      : isDarkTheme
      ? dark200
      : teal800;
  const magicNumberColor =
    color && color !== 'Catskill'
      ? baseSwatches[color].vivid
      : isDarkTheme
      ? dark400
      : teal600;

  const backgroundColor = bubbleBgColor || fallbackBgColor;
  const textColor = bubbleColor || fallbackColor;
  return {
    backgroundColor,
    textColor,
    magicNumberColor,
    filters: css({
      mixBlendMode: 'luminosity',
    }),
    hover: css({
      mixBlendMode: 'multiply',
    }),
  };
};
