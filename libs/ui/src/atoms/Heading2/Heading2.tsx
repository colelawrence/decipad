/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { blockAlignment } from '../../styles';

const styles = css(blockAlignment.heading2.typography, {
  wordBreak: 'break-word',
});

interface Heading2Props {
  readonly children: ReactNode;
  readonly Heading: 'h3';
  readonly id: string;
}

export const Heading2 = ({
  children,
  Heading,
  id,
}: Heading2Props): ReturnType<React.FC> => {
  // h{id} is because of css query selectors, dont remove the h
  return (
    <Heading id={`h${id}`} css={styles}>
      {children}
    </Heading>
  );
};
