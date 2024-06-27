import { css } from '@emotion/react';
import {
  brand600,
  cssVar,
  grey500,
  normalOpacity,
  offBlack,
  p10Bold,
  p10Regular,
  p12Regular,
  p14Bold,
  p14Regular,
  red400,
  transparency,
} from 'libs/ui/src/primitives';

const shadow1 = transparency(grey500, 0.02).rgba;
const shadow2 = transparency(grey500, 0.08).rgba;

export const plotBorder = cssVar('borderSubdued');
export const plotTextColor = cssVar('textDefault');

export const chartToolTipStyle = {
  padding: 4,
  backgroundColor: cssVar('backgroundAccent'),
  boxShadow: `0px 1px 2px ${shadow1}, 0px 2px 12px ${shadow2}`,
  border: `1px solid ${cssVar('borderSubdued')}`,
  borderRadius: '8px',
};

export const seriesContainerStyle = css`
  margin-bottom: 5px;
`;

export const seriesBeanAndValueStyles = css({
  display: 'flex',
  flexFlow: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const seriesLabelStyle = css(p12Regular, {
  display: 'flex',
  flexFlow: 'column',
  minWidth: '200px',
  padding: '5px 10px 2px 10px',
  gap: '5px',
  button: {
    padding: 0,
  },
});

export const nameValueContainerStyle = css`
  display: flex;
  flex-grow: 1;
`;

export const nameStyle = css({
  color: plotTextColor,
  marginLeft: 8,
  flexGrow: 1,
});

export const contextStyle = css({
  color: cssVar('textSubdued'),
});

export const quarterCircleStyle = (color: string, size: number = 12) => css`
  align-self: center;
  width: ${size}px;
  height: ${size}px;
  background-color: ${color};
  border-radius: 3px;
`;

export const valueStyle = [p14Bold, { color: cssVar('textHeavy') }];

export const legendStyles = {
  display: 'flex',
  justifyContent: 'left',
  gap: 6,
  marginTop: 6,
};

export const tooltipLabelStyles = css(p14Regular, { paddingLeft: 10 });

export const lineChartLegendStyle = css(p10Bold, { color: plotTextColor });

export const pieLabelWrapperStyles = css({
  padding: 2,
  textAlign: 'center',
  backgroundColor: transparency(offBlack, normalOpacity).rgba,
  borderRadius: 6,
});

export const pieLabelNameStyles = css(p10Bold, {
  color: cssVar('textHeavy'),
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const pieLabePercentageStyles = css(p10Regular, {
  color: cssVar('textDefault'),
});

export const positivePercentageLabel = {
  color: brand600.hex,
};

export const negativePercentageLabel = {
  color: red400.hex,
};
