/* eslint decipad/css-prop-named-variable: 0 */
import { css, SerializedStyles } from '@emotion/react';
import { createPrimitiveElement } from '@udecode/plate-common';
import { Anchor } from '../../../utils';
import { componentCssVars } from '../../../primitives';
import { ComponentProps } from 'react';

type LinkColor = 'default' | 'danger' | 'plain';

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
  plain: css({
    color: componentCssVars('LinkPlainColor'),
    ':hover,:visited:hover': {
      color: componentCssVars('LinkPlainHoverColor'),
    },
    ':visited': { color: componentCssVars('LinkPlainHoverColor') },
  }),
};

const LinkSlot = createPrimitiveElement('a');

interface LinkProps
  extends Omit<ComponentProps<typeof LinkSlot>, 'contentEditable'> {
  color?: LinkColor;
  noUnderline?: boolean;
  children: React.ReactNode;
}

export const Link = ({
  children,
  color = 'default',
  noUnderline,
  ...props
}: LinkProps) => {
  const paint = styleColors[color];
  const underline = noUnderline ? undefined : underlineStyles;
  return (
    <Anchor css={css(styles, paint, underline)} {...(props as any)}>
      {children}
    </Anchor>
  );
};
