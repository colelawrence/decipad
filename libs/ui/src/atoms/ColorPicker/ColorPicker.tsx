import { css } from '@emotion/react';
import { FC } from 'react';
import { Check } from '../../icons';
import {
  offBlack,
  cssVar,
  normalOpacity,
  weakOpacity,
  transparency,
  OpaqueColor,
} from '../../primitives';

const styles = css({
  width: '27px', // 3px of border
  height: '27px',
  borderRadius: '50%',
});

const iconWrapperStyles = css({
  display: 'grid',
  placeItems: 'center',
  padding: '7px',
});

type ColorPickerProps = {
  readonly color: OpaqueColor;
  readonly selected: boolean;
};

export const ColorPicker = ({
  color,
  selected,
}: ColorPickerProps): ReturnType<FC> => {
  return (
    <div
      role="option"
      aria-selected={selected}
      css={[
        styles,
        {
          backgroundColor: color.rgb,
          border: `1px solid ${cssVar('backgroundColor')}`,
          boxShadow: `inset 0 0 0 1px ${
            transparency(offBlack, weakOpacity).rgba
          }`,
          ':hover, :focus': {
            boxShadow: `inset 0 0 0 1px ${
              transparency(offBlack, weakOpacity).rgba
            },  0 0 0 1px ${transparency(color, normalOpacity).rgba}`,
          },
        },
        selected
          ? {
              boxShadow: `inset 0 0 0 1px ${
                transparency(offBlack, weakOpacity).rgba
              },  0 0 0 1px ${transparency(color, normalOpacity).rgba}`,
            }
          : {},
      ]}
    >
      <span css={iconWrapperStyles}>{selected ? <Check /> : ''}</span>
    </div>
  );
};
