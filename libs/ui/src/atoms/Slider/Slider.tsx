import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC } from 'react';
import { black, cssVar, grey700, transparency } from '../../primitives';

const thumbBorderWidth = 1;
const thumbSize = 20;

const thumbStyles = {
  boxShadow: `0px 2px 20px ${transparency(grey700, 0.04)}, 
    0px 2px 8px ${transparency(black, 0.02)}`,

  border: `${thumbBorderWidth}px solid ${cssVar('strongerHighlightColor')}`,
  borderRadius: '8px',

  height: `${thumbSize}px`,
  width: `${thumbSize}px`,

  background: cssVar('backgroundColor'),

  cursor: 'pointer',
};

const trackStyles = {
  borderRadius: '8px',

  width: '100%',
  height: '4px',

  background: cssVar('highlightColor'),

  cursor: 'pointer',
};

const progressStyles = {
  background: cssVar('strongerHighlightColor'),
};

const styles = css({
  width: '100%', // Specific width is required for Firefox.

  background: 'transparent', // Otherwise white in Chrome.

  WebkitAppearance: 'none', // Remove the vendor slider styles so that it can be customized.
  '::-webkit-slider-thumb': {
    ...thumbStyles,
    marginTop: `calc(-${thumbSize}px / 2 + ${thumbBorderWidth}px * 2)`, // Need to center the thumb in Chrome.
    WebkitAppearance: 'none', // Remove the vendor slider styles.
  },
  '::-webkit-slider-runnable-track': trackStyles,
  // '::-webkit-': progressStyles,

  '::-moz-range-thumb': thumbStyles,
  '::-moz-range-track': trackStyles,
  '::-moz-range-progress': progressStyles,

  ':focus': {
    outline: 'none', // Removes the blue border. You should probably do some kind of focus styling for accessibility reasons though.
  },
});

interface SliderProps {
  readonly onChange?: (value: number) => void;
  readonly max?: number;
  readonly min?: number;
  readonly step?: number;
  readonly value?: number;
}

export const Slider = ({
  onChange = noop,
  max,
  min,
  step,
  value,
}: SliderProps): ReturnType<FC> => (
  <input
    css={styles}
    type="range"
    onChange={(e) => onChange(Number(e.target.value))}
    max={max}
    min={min}
    step={step}
    value={value}
  />
);
