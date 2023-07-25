/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { blockAlignment } from '../../styles';

const styles = css(blockAlignment.heading2.typography, {
  wordBreak: 'break-word',
});

interface Heading2Props {
  readonly children: ReactNode;
  readonly id: string;
}

export const Heading2: FC<Heading2Props> = ({ children, id }) => (
  // h{id} is because of css query selectors, dont remove the h
  <h3 id={`h${id}`} css={styles}>
    {children}
  </h3>
);
