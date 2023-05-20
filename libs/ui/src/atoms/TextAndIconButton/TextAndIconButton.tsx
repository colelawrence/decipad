import { css } from '@emotion/react';
import { FC, ReactNode, useState } from 'react';
import { Refresh } from '../../icons';
import {
  black,
  cssVar,
  p13Medium,
  rotation,
  transparency,
} from '../../primitives';
import { Anchor, TextChildren } from '../../utils';
import { useEventNoEffect } from '../../utils/useEventNoEffect';

const wrapperStyles = {
  display: 'inline-block',
};

const styles = css({
  borderRadius: '6px',
  border: `1px solid ${cssVar('borderColor')}`,
  backgroundColor: cssVar('tintedBackgroundColor'),

  ':hover, :focus': {
    backgroundColor: cssVar('strongHighlightColor'),
  },
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '4px',
});

const buttonTextStyles = css(p13Medium, {
  whiteSpace: 'nowrap',
  padding: '0 4px',
});

const blueBackgroundStyles = css({
  backgroundColor: cssVar('weakerSlashIconColor'),
  border: `solid 1px ${transparency(black, 0.08).rgba}`,

  ':hover, :focus': {
    backgroundColor: cssVar('weakSlashIconColor'),
  },
});

const redBackgroundStyles = css({
  backgroundColor: cssVar('buttonDangerLight'),
  border: `solid 1px ${transparency(black, 0.08).rgba}`,

  ':hover, :focus': {
    backgroundColor: cssVar('buttonDangerHeavy'),
  },
});

const transparentBackgroundStyles = css({
  border: 'none',
  backgroundColor: 'transparent',

  ':hover, :focus': {
    backgroundColor: 'transparent',
  },
});

const iconStyles = css({
  width: '12px',
});

type IconButtonProps = {
  readonly children: ReactNode;
  readonly text: TextChildren;
  readonly color?: 'default' | 'blue' | 'transparent' | 'red';
  readonly iconPosition?: 'left' | 'right';
  readonly href?: string;
  readonly onClick?: () => void;
  readonly animateIcon?: boolean;
};

export const TextAndIconButton = ({
  children,
  text,
  onClick,
  href,
  color,
  iconPosition = 'right',
  animateIcon = false,
}: IconButtonProps): ReturnType<FC> => {
  const onButtonClick = useEventNoEffect(onClick);
  const [animated, setAnimated] = useState(false);
  const [currentColor, setCurrentColor] = useState(color);
  const [currentIcon, setCurrentIcon] = useState(children);

  const textElement = <span css={buttonTextStyles}>{text}</span>;
  const iconElement = (
    <span
      css={[
        iconStyles,
        animated && {
          animationName: rotation,
          animationDuration: '1s',
          animationIterationCount: 'infinite',
          animationTimingFunction: 'linear',
          animationPlayState: 'running',
        },
      ]}
    >
      {currentIcon}
    </span>
  );
  return (
    <div css={wrapperStyles}>
      {onClick ? (
        <button
          css={[
            styles,
            currentColor === 'blue' && blueBackgroundStyles,
            currentColor === 'red' && redBackgroundStyles,
            currentColor === 'transparent' && transparentBackgroundStyles,
          ]}
          onClick={(ev) => {
            if (animateIcon) {
              setAnimated(true);
              setCurrentColor('default');
              setCurrentIcon(<Refresh />);
              setTimeout(() => {
                setAnimated(false);
                setCurrentColor(color);
                setCurrentIcon(children);
              }, 5000);
            }
            onButtonClick(ev);
          }}
        >
          {iconPosition === 'left' ? (
            <>
              {iconElement}
              {textElement}
            </>
          ) : (
            <>
              {textElement}
              {iconElement}
            </>
          )}
        </button>
      ) : (
        <Anchor href={href} css={css([styles])}>
          {iconPosition === 'left' ? iconElement : null}
          {textElement}
          {iconPosition === 'right' ? iconElement : null}
        </Anchor>
      )}
    </div>
  );
};
