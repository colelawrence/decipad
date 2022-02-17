import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { blockAlignment } from '../../styles';

const styles = css(blockAlignment.heading1.typography, {
  padding: `${blockAlignment.heading1.paddingTop} 0 16px 0`,
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
