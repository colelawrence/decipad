/* eslint decipad/css-prop-named-variable: 0 */
import { AnimatedIcon, componentCssVars } from '@decipad/ui';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, ReactNode, useEffect, useState } from 'react';
import { Refresh } from '../../icons';
import {
  black,
  cssVar,
  p12Medium,
  p13Medium,
  transparency,
} from '../../primitives';
import { Anchor, TextChildren } from '../../utils';
import { useEventNoEffect } from '../../utils/useEventNoEffect';

type IconButtonProps = {
  readonly text?: TextChildren;
  readonly children?: ReactNode;
  readonly color?:
    | 'default'
    | 'blue'
    | 'transparent'
    | 'transparent-green'
    | 'red'
    | 'grey'
    | 'brand';
  readonly iconPosition?: 'left' | 'right';
  readonly size?: 'fit' | 'normal';
  readonly href?: string;
  readonly disabled?: boolean;
  readonly onClick?: () => void;
  readonly animateIcon?: boolean;
  readonly variantHover?: boolean;
  readonly notSelectedLook?: boolean;
};

export const TextAndIconButton = ({
  children,
  text = '',
  href,
  color,
  onClick,
  size = 'fit',
  iconPosition = 'right',
  animateIcon = false,
  variantHover = false,
  notSelectedLook = false,
  disabled = false,
}: IconButtonProps): ReturnType<FC> => {
  const onButtonClick = useEventNoEffect(disabled ? noop : onClick);
  const [animated, setAnimated] = useState(false);
  const [currentColor, setCurrentColor] = useState(color);
  const [currentIcon, setCurrentIcon] = useState(children);

  useEffect(() => setCurrentIcon(children), [children]);

  const textElement = (
    <span
      data-testid={`text-icon-button:${text}`}
      css={[
        buttonTextStyles(notSelectedLook),
        notSelectedLook && { color: cssVar('textDisabled') },
      ]}
    >
      {text}
    </span>
  );

  const iconElement = currentIcon && (
    <AnimatedIcon icon={currentIcon} animated={animated} size={size} />
  );
  const buttonStyles = css([
    styles(size, variantHover),
    { cursor: 'pointer' },
    animateIcon
      ? [
          currentColor === 'blue' && blueBackgroundStyles(disabled),
          currentColor === 'red' && redBackgroundStyles(disabled),
          currentColor === 'transparent' &&
            transparentBackgroundStyles(disabled),
          currentColor === 'transparent-green' &&
            transparentGreenBackgroundStyles(disabled),
          currentColor === 'grey' && greyBackgroundStyles(disabled),
          currentColor === 'brand' && brandBackgroundStyles(disabled),
        ]
      : [
          color === 'blue' && blueBackgroundStyles(disabled),
          color === 'red' && redBackgroundStyles(disabled),
          color === 'transparent' && transparentBackgroundStyles(disabled),
          currentColor === 'transparent-green' &&
            transparentGreenBackgroundStyles(disabled),
          color === 'grey' && greyBackgroundStyles(disabled),
          color === 'brand' && brandBackgroundStyles(disabled),
        ],
  ]);
  return (
    <div css={wrapperStyles} contentEditable={false}>
      {onClick ? (
        <button
          css={buttonStyles}
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
        <Anchor href={disabled ? '' : href} css={buttonStyles}>
          {iconPosition === 'left' ? iconElement : null}
          {textElement}
          {iconPosition === 'right' ? iconElement : null}
        </Anchor>
      )}
    </div>
  );
};

const wrapperStyles = {
  display: 'inline-block',
  height: '100%',
};

const styles = (size: 'fit' | 'normal', variantHover: boolean) =>
  css([
    {
      borderRadius: '6px',
      border: `1px solid ${cssVar('borderDefault')}`,
      backgroundColor: cssVar('backgroundSubdued'),

      ':hover, :focus': {
        backgroundColor: cssVar('backgroundHeavy'),
      },
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      padding: '4px',
    },
    size === 'normal' && { height: 32, padding: 14 },
    variantHover && {
      ':hover, :focus': {
        backgroundColor: cssVar('backgroundSubdued'),
      },
      ':hover': {
        color: cssVar('textDefault'),
      },
    },
  ]);

const buttonTextStyles = (notSelectedLook: boolean) =>
  css(p12Medium, [
    {
      color: cssVar('textDefault'),
      whiteSpace: 'nowrap',
      padding: '0 4px',
    },
    notSelectedLook && {
      ':hover': {
        color: cssVar('textHeavy'),
      },
    },
  ]);

const blueBackgroundStyles = (_disabled: boolean) =>
  css({
    backgroundColor: componentCssVars('WeakerSlashIconColor'),
    border: `solid 1px ${transparency(black, 0.08).rgba}`,

    ':hover, :focus': {
      backgroundColor: componentCssVars('WeakSlashIconColor'),
    },
  });

const redBackgroundStyles = (_disabled: boolean) =>
  css(p13Medium, {
    backgroundColor: cssVar('stateDangerBackground'),
    border: `solid 1px ${transparency(black, 0.08).rgba}`,

    ':hover, :focus': {
      backgroundColor: cssVar('stateDangerIconBackground'),
    },
  });

const transparentBackgroundStyles = (_disabled: boolean) =>
  css(p13Medium, {
    backgroundColor: 'transparent',
    border: `solid 1px transparent`,

    ':hover, :focus': {
      backgroundColor: 'transparent',
    },
  });

const transparentGreenBackgroundStyles = (_disabled: boolean) =>
  css(p13Medium, {
    backgroundColor: 'transparent',
    border: `solid 1px transparent`,
    color: componentCssVars('AiTextColor'),

    span: {
      color: componentCssVars('AiTextColor'),
    },
    svg: {
      fill: componentCssVars('AiTextColor'),
    },
    ':hover, :focus': {
      backgroundColor: 'transparent',
    },
  });

const greyBackgroundStyles = (disabled: boolean) =>
  css(p13Medium, {
    backgroundColor: cssVar(
      disabled ? 'backgroundSubdued' : 'backgroundDefault'
    ),
    border: `solid 1px ${transparency(black, 0.08).rgba}`,

    ':hover, :focus': {
      backgroundColor: cssVar(
        disabled ? 'backgroundSubdued' : 'backgroundDefault'
      ),
    },
  });

const brandBackgroundStyles = (disabled: boolean) =>
  css(p13Medium, {
    color: componentCssVars(
      disabled ? 'ButtonPrimaryDisabledText' : 'ButtonPrimaryDefaultText'
    ),
    backgroundColor: componentCssVars(
      disabled
        ? 'ButtonPrimaryDisabledBackground'
        : 'ButtonPrimaryDefaultBackground'
    ),
    border: `solid 1px transparent`,

    ':hover, :focus': {
      backgroundColor: componentCssVars(
        disabled
          ? 'ButtonPrimaryDisabledBackground'
          : 'ButtonPrimaryHoverBackground'
      ),
    },
  });
