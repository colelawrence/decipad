import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { h2 } from '../../primitives';

const styles = css(h2, {
  padding: '12px 0',
});

interface Heading2Props {
  readonly children: ReactNode;
  readonly Heading: 'h3';
}

export const Heading2 = ({
  children,
  Heading,
}: Heading2Props): ReturnType<React.FC> => {
  return <Heading css={styles}>{children}</Heading>;
};
