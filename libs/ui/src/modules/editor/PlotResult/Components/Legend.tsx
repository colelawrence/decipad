import { SerializedStyles } from '@emotion/react';
import React from 'react';
import { lineChartLegendStyle, nameValueContainerStyle } from './styles';

interface LegendProps {
  readonly value: string;
  readonly iconStyle: SerializedStyles;
}

export const Legend: React.FC<LegendProps> = ({ value, iconStyle }) => {
  return (
    <div css={nameValueContainerStyle}>
      <span css={iconStyle}></span>
      <span css={lineChartLegendStyle}>{value}</span>
    </div>
  );
};
