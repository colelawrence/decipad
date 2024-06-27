import { CSSObject } from '@emotion/react';
import { cssVar, p10Regular, p18Medium } from 'libs/ui/src/primitives';
import { CSSProperties } from 'react';
import { tooltipLineColor } from '../helpers';

const keys = [
  'color',
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontWeight',
  'letterSpacing',
  'fontFeatureSettings',
  'lineHeight',
] as const;

type FontStyleKeys = typeof keys[number];

type ChartAxisFontStyles = {
  [key in FontStyleKeys]: string;
};

function convertFontToRechartsStyle(emotionStyle: CSSObject): CSSProperties {
  const rechartsStyle: Partial<ChartAxisFontStyles> = {};

  keys.forEach((key) => {
    const value = emotionStyle[key];
    if (value) {
      if (key === 'lineHeight' && typeof value === 'number') {
        rechartsStyle[key] = value.toString();
      } else {
        if (typeof value !== 'string') {
          return;
        }
        rechartsStyle[key] = typeof value === 'number' ? `${value}px` : value;
      }
    }
  });

  return rechartsStyle as CSSProperties;
}

export const chartAxisFontStyles = convertFontToRechartsStyle(p10Regular);
export const chartAxisBigFontStyles = convertFontToRechartsStyle(p18Medium);

export const noDataChartStyles = {
  ...chartAxisFontStyles,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: '100%',
  fontSize: '16px',
};

export const tooltipCursorStyle = (isDarkTheme: boolean) => ({
  stroke: tooltipLineColor(isDarkTheme),
  strokeWidth: 1,
  strokeDasharray: '3 3',
});

export const activeDotStyle = (currentColor: string) => ({
  stroke: currentColor,
  fill: cssVar('backgroundMain'),
  r: 3,
});
