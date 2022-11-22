import { css } from '@emotion/react';
import { HTMLPropsAs } from '@udecode/plate';
import { malibu700 } from '../../primitives';
import { Anchor } from '../../utils';

const styles = css({
  display: 'inline',
  color: malibu700.rgb,
  textDecoration: 'underline',

  ':hover,:visited:hover': {
    color: malibu700.rgb,
  },
  ':visited': { color: malibu700.rgb },
});

interface LinkProps extends HTMLPropsAs<'a'> {}

export const Link = ({
  children,
  ...props
}: LinkProps): ReturnType<React.FC> => {
  return (
    <Anchor css={styles} {...(props as any)}>
      {children}
    </Anchor>
  );
};
