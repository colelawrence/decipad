/* eslint decipad/css-prop-named-variable: 0 */
import { SerializedStyles, css } from '@emotion/react';
import { HTMLPropsAs } from '@udecode/plate';
import { Anchor } from '../../utils';
import { componentCssVars } from '../../primitives';

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
    color: componentCssVars('LinkDefaultColor'),
    ':hover,:visited:hover': {
      color: componentCssVars('LinkDefaultHoverColor'),
    },
    ':visited': { color: componentCssVars('LinkDefaultHoverColor') },
  }),
  danger: css({
    color: componentCssVars('LinkDangerColor'),
    ':hover,:visited:hover': {
      color: componentCssVars('LinkDangerHoverColor'),
    },
    ':visited': { color: componentCssVars('LinkDangerHoverColor') },
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
