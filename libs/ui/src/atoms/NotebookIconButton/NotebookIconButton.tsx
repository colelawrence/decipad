/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import {
  grey200,
  normalOpacity,
  OpaqueColor,
  setCssVar,
  transparency,
  cssVar,
} from '../../primitives';
import { baseSwatches } from '../../utils';

const buttonStyles = css({
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  width: '24px',
  height: '24px',
  borderRadius: '4px',
  backgroundColor: grey200.rgb,
  display: 'grid',
  placeItems: 'center',
});

const iconSize = css({
  mixBlendMode: 'luminosity',
  opacity: '90%',
  display: 'inline-block',
  width: '22px',
  height: '22px',
  '> svg > rect': {
    fill: 'none',
  },
});

type IconButtonProps = {
  readonly onClick?: () => void;
  readonly children: ReactNode;
  readonly color?: OpaqueColor;
};

export const NotebookIconButton: FC<IconButtonProps> = ({
  children,
  onClick,
  color = baseSwatches.Catskill,
}) => {
  return (
    <div
      css={[
        buttonStyles,
        css({
          backgroundColor: transparency(color, normalOpacity).rgba,
          ':hover, :focus': {
            backgroundColor: color.rgb,
          },
        }),
      ]}
      onClick={onClick}
    >
      <span css={iconSize}>{children}</span>
    </div>
  );
};
