/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { blockAlignment } from '../../styles';

const styles = css(blockAlignment.heading1.typography, {
  wordBreak: 'break-word',
});

interface Heading1Props {
  readonly children: ReactNode;
  readonly Heading: 'h2';
  readonly id: string;
}

export const Heading1 = ({
  children,
  Heading,
  id,
}: Heading1Props): ReturnType<React.FC> => {
  // h{id} is because of css query selectors, dont remove the h
  return (
    <Heading id={`h${id}`} css={styles}>
      {children}
    </Heading>
  );
};
