/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar, grey200 } from '../../primitives';

const buttonStyles = css({
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
  readonly isDefaultBackground: boolean;
};

export const NotebookIconButton: FC<IconButtonProps> = ({
  children,
  onClick,
  isDefaultBackground,
}) => {
  return (
    <div
      css={[
        buttonStyles,
        css({
          backgroundColor: isDefaultBackground
            ? cssVar('backgroundSubdued')
            : cssVar('themeBackgroundSubdued'),
          ':hover, :focus': {
            backgroundColor: isDefaultBackground
              ? cssVar('backgroundHeavy')
              : cssVar('themeBackgroundHeavy'),
          },
        }),
      ]}
      onClick={onClick}
    >
      <span css={iconSize}>{children}</span>
    </div>
  );
};
