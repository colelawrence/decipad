/* eslint-disable decipad/css-prop-named-variable */
import { JellyBeans } from 'libs/ui/src/shared';
import { legendStyles, quarterCircleStyle } from './styles';
import { PieLegendProps } from './types';
import { defaultChartMargins } from '../helpers';

export const PieLegend = ({ payload, wrapperStyle }: PieLegendProps) => {
  if (!Array.isArray(payload)) {
    return null;
  }

  return (
    <div
      style={{
        ...wrapperStyle,
        ...legendStyles,
        marginRight: defaultChartMargins.right * -1, // Grow under the vertical axis space
      }}
    >
      <JellyBeans
        noMultiline={true}
        beans={payload
          .filter((e) => e && e.value != null)
          .map((e) => {
            const { value, color } = e;
            const icon = color && (
              <div css={quarterCircleStyle(color || '#ccc')} />
            );

            return {
              text: value as string,
              icon,
            };
          })}
      />
    </div>
  );
};
