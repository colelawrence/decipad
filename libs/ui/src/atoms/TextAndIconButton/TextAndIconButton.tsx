import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar, p13Medium } from '../../primitives';
import { Anchor, TextChildren } from '../../utils';

const wrapperStyles = {
  display: 'inline-block',
};

const styles = css({
  borderRadius: '8px',
  border: `1px solid ${cssVar('strongHighlightColor')}`,
  backgroundColor: cssVar('tintedBackgroundColor'),

  ':hover, :focus': {
    backgroundColor: cssVar('strongHighlightColor'),
  },
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-end',
  padding: '4px',
  paddingLeft: '8px',
});

const buttonTextStyles = css(p13Medium, {
  whiteSpace: 'nowrap',
  color: cssVar('weakTextColor'),
});

const roundedSquareStyles = css({
  borderRadius: '6px',
});

const iconStyles = css({
  width: '12px',
  verticalAlign: 'middle',
  margin: '3px 7px',
});

type IconButtonProps = {
  readonly children: ReactNode;
  readonly text: TextChildren;
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
}: IconButtonProps): ReturnType<FC> => {
  const t = <span css={buttonTextStyles}>{text}</span>;
  const i = <span css={iconStyles}>{children}</span>;
  return (
    <div css={wrapperStyles}>
      {onClick ? (
        <button
          css={[styles, roundedSquareStyles]}
          onClick={(event) => {
            event.preventDefault();
            onClick();
          }}
        >
          {t}
          {i}
        </button>
      ) : (
        <Anchor href={href} css={css([styles, roundedSquareStyles])}>
          {t}
          {i}
        </Anchor>
      )}
    </div>
  );
};
