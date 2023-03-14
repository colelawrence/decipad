import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { blue100, blue200, cssVar, p13Medium } from '../../primitives';
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
  backgroundColor: blue100.rgb,

  ':hover, :focus': {
    backgroundColor: blue200.rgb,
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
  readonly color?: 'default' | 'blue' | 'transparent';
  readonly iconPosition?: 'left' | 'right';
  readonly href?: string;
  readonly onClick?: () => void;
};

export const TextAndIconButton = ({
  children,
  text,
  onClick,
  href,
  color,
  iconPosition = 'right',
}: IconButtonProps): ReturnType<FC> => {
  const onButtonClick = useEventNoEffect(onClick);
  const textElement = <span css={buttonTextStyles}>{text}</span>;
  const iconElement = <span css={iconStyles}>{children}</span>;
  return (
    <div css={wrapperStyles}>
      {onClick ? (
        <button
          css={[
            styles,
            color === 'blue' && blueBackgroundStyles,
            color === 'transparent' && transparentBackgroundStyles,
          ]}
          onClick={onButtonClick}
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
