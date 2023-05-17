import { SerializedStyles, css } from '@emotion/react';
import { HTMLPropsAs } from '@udecode/plate';
import { cssVar } from '../../primitives';
import { Anchor } from '../../utils';

type LinkColor = 'default' | 'danger';

const styles = css({
  cursor: 'pointer',
  display: 'inline',
});

const underlineStyles = css({
  textDecoration: 'underline',
});

const styleColors: Record<LinkColor, SerializedStyles> = {
  default: css({
    color: cssVar('linkNormalColor'),
    ':hover,:visited:hover': {
      color: cssVar('linkNormalHoverColor'),
    },
    ':visited': { color: cssVar('linkNormalHoverColor') },
  }),
  danger: css({
    color: cssVar('linkDangerColor'),
    ':hover,:visited:hover': {
      color: cssVar('linkDangerHoverColor'),
    },
    ':visited': { color: cssVar('linkDangerColor') },
  }),
};

interface LinkProps extends HTMLPropsAs<'a'> {
  color?: LinkColor;
  noUnderline?: boolean;
}

export const Link = ({
  children,
  color = 'default',
  noUnderline,
  ...props
}: LinkProps): ReturnType<React.FC> => {
  const paint = styleColors[color];
  const underline = noUnderline ? undefined : underlineStyles;
  return (
    <Anchor css={css(styles, paint, underline)} {...(props as any)}>
      {children}
    </Anchor>
  );
};
