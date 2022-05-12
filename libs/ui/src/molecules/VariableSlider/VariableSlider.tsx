import { css } from '@emotion/react';
import { ComponentProps } from 'react';
import { Slider } from '../../atoms';
import { cssVar, p32Medium, setCssVar } from '../../primitives';

const styles = css({
  display: 'grid',
  gridGap: '2px',
});

const valueStyles = css(
  p32Medium,
  setCssVar('currentTextColor', cssVar('strongTextColor'))
);

type VariableSliderProps = ComponentProps<typeof Slider>;

export const VariableSlider = (props: VariableSliderProps) => {
  return (
    <div css={styles}>
      <div css={valueStyles}>{props.value}</div>
      <Slider {...props} />
    </div>
  );
};
