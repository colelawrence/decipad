import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { h1 } from '../../primitives';

const styles = css(h1, {
  padding: '18px 0 16px 0',
});

interface Heading1Props {
  readonly children: ReactNode;
  readonly Heading: 'h2';
}

export const Heading1 = ({
  children,
  Heading,
}: Heading1Props): ReturnType<React.FC> => {
  return <Heading css={styles}>{children}</Heading>;
};
