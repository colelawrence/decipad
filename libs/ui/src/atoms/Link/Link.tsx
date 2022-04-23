import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { malibu700, p16Regular } from '../../primitives';
import { Anchor } from '../../utils';

const styles = css(p16Regular, {
  textDecoration: 'underline',
  color: malibu700.rgb,
  cursor: 'pointer',
});

interface LinkProps {
  readonly children: ReactNode;
  readonly href: string;
}

export const Link = ({ children, href }: LinkProps): ReturnType<React.FC> => {
  return (
    <Anchor css={styles} href={href}>
      {children}
    </Anchor>
  );
};
