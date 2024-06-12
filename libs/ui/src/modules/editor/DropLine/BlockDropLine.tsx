/* eslint decipad/css-prop-named-variable: 0 */
import {
  dropLineThickness,
  dropLineCommonStyles,
} from '../../../styles/drop-line';
import { componentCssVars } from '../../../primitives';

export interface BlockDropLineProps {
  variant: 'horizontal' | 'vertical';
  mainAxis: number;
  crossAxisStart: number;
  crossAxisEnd: number;
}

export const BlockDropLine = ({
  variant,
  mainAxis,
  crossAxisStart,
  crossAxisEnd,
}: BlockDropLineProps) => {
  const {
    mainAxisProp,
    crossAxisStartProp,
    crossAxisLengthProp,
    thicknessProp,
  } = (
    {
      horizontal: {
        mainAxisProp: 'top',
        crossAxisStartProp: 'left',
        crossAxisLengthProp: 'width',
        thicknessProp: 'height',
      },
      vertical: {
        mainAxisProp: 'left',
        crossAxisStartProp: 'top',
        crossAxisLengthProp: 'height',
        thicknessProp: 'width',
      },
    } as const
  )[variant];

  return (
    <div
      css={[
        dropLineCommonStyles,
        {
          position: 'fixed',
          [thicknessProp]: dropLineThickness,
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: componentCssVars('DropLineBorderColor'),
          boxSizing: 'content-box',
          borderRadius: 2,
          pointerEvents: 'none',
        },
      ]}
      // https://emotion.sh/docs/best-practices#use-the-style-prop-for-dynamic-styles
      style={{
        [mainAxisProp]: mainAxis,
        [crossAxisStartProp]: crossAxisStart,
        [crossAxisLengthProp]: crossAxisEnd - crossAxisStart,
      }}
    />
  );
};
