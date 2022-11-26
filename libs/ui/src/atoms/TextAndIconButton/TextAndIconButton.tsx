import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { blue100, blue200, cssVar, p13Medium } from '../../primitives';
import { Anchor, TextChildren } from '../../utils';
import { useMouseEventNoEffect } from '../../utils/useMouseEventNoEffect';

const wrapperStyles = {
  display: 'inline-block',
};

const styles = css({
  borderRadius: '6px',
  border: `1px solid ${cssVar('strongHighlightColor')}`,
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

const iconStyles = css({
  width: '12px',
});

type IconButtonProps = {
  readonly children: ReactNode;
  readonly text: TextChildren;
  readonly color?: 'blue';
  readonly iconPosition?: 'left' | 'right';
} & (
  | {
      readonly href: string;
      readonly onClick?: undefined;
    }
  | {
      readonly onClick: () => void;
      readonly href?: undefined;
    }
);

export const TextAndIconButton = ({
  children,
  text,
  onClick,
  href,
  color,
  iconPosition = 'right',
}: IconButtonProps): ReturnType<FC> => {
  const onButtonClick = useMouseEventNoEffect(onClick);
  const textElement = <span css={buttonTextStyles}>{text}</span>;
  const iconElement = <span css={iconStyles}>{children}</span>;
  const textAndIcon =
    iconPosition === 'left' ? (
      <>
        {iconElement}
        {textElement}
      </>
    ) : (
      <>
        {textElement}
        {iconElement}
      </>
    );
  return (
    <div css={wrapperStyles}>
      {onClick ? (
        <button
          css={[styles, color === 'blue' && blueBackgroundStyles]}
          onClick={onButtonClick}
        >
          {textAndIcon}
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
