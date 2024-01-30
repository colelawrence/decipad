/* eslint decipad/css-prop-named-variable: 0 */
import { css, SerializedStyles } from '@emotion/react';
import { createSlotComponent } from '@udecode/plate-common';
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

const LinkSlot = createSlotComponent('a');

interface LinkProps extends ComponentProps<typeof LinkSlot> {
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
