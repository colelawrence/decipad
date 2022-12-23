import { useThemeFromStore } from '@decipad/react-contexts';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import * as SliderUI from '@radix-ui/react-slider';
import { FC, InputHTMLAttributes } from 'react';
import {
  brand400,
  cssVar,
  grey700,
  offBlack,
  transparency,
} from '../../primitives';
import { AvailableSwatchColor, swatchesThemed } from '../../utils';

const thumbBorderWidth = 1;
const thumbSize = 20;
const trackHeight = 4;

const sliderWrapperStyles = css({
  padding: `calc(${thumbSize}px / 2 - ${trackHeight}px / 2) 7px`,
  width: '100%', // Specific width is required for Firefox.
});

const sliderStyles = css({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  userSelect: 'none',
  touchAction: 'none',
  width: '280',
});

const trackStyles = css({
  backgroundColor: cssVar('highlightColor'),
  position: 'relative',
  flexGrow: 1,
  borderRadius: '9999px',
  height: trackHeight,
});

const rangeStyles = css({
  position: 'absolute',
  backgroundColor: brand400.rgb,
  borderRadius: '9999px',
  height: '100%',
});

const thumbStyles = css({
  all: 'unset',
  boxShadow: `0px 2px 20px ${transparency(grey700, 0.04)},
  0px 2px 8px ${transparency(offBlack, 0.02)}`,

  border: `${thumbBorderWidth}px solid ${cssVar('borderColor')}`,
  borderRadius: '8px',

  height: `${thumbSize}px`,
  width: `${thumbSize}px`,

  backgroundColor: cssVar('iconColorLight'),

  cursor: 'pointer',
  display: 'block',
});

interface SliderProps {
  readonly onChange?: (value: number) => void;
  readonly onFocus?: InputHTMLAttributes<HTMLInputElement>['onFocus'];
  readonly max?: number;
  readonly min?: number;
  readonly step?: number;
  readonly value?: number;
  readonly color?: AvailableSwatchColor;
}

export const Slider = ({
  onChange = noop,
  onFocus = noop,
  max = 10,
  min = 0,
  step = 1,
  value = 0,
  color: colorName,
}: SliderProps): ReturnType<FC> => {
  const [darkTheme] = useThemeFromStore();
  const baseSwatches = swatchesThemed(darkTheme);
  const color = baseSwatches[colorName || 'Sulu'];
  return (
    <div css={sliderWrapperStyles}>
      <SliderUI.Root
        css={sliderStyles}
        value={[Number(value)]}
        onValueChange={(values) => values.map(onChange)}
        onFocus={onFocus}
        min={min}
        max={Math.max(Number(max), Number(value))}
        step={step}
      >
        <SliderUI.Track css={trackStyles}>
          <SliderUI.Range
            css={[rangeStyles, color && { backgroundColor: color.rgb }]}
          />
        </SliderUI.Track>
        <SliderUI.Thumb css={thumbStyles} />
      </SliderUI.Root>
    </div>
  );
};
