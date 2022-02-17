import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { blockAlignment } from '../../styles';

const styles = css(blockAlignment.heading2.typography, {
  padding: `${blockAlignment.heading2.paddingTop} 0 16px 0`,
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
