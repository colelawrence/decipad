/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { blockAlignment } from '../../styles';

const styles = css(blockAlignment.heading1.typography, {
  wordBreak: 'break-word',
});

interface Heading1Props {
  readonly children: ReactNode;
  readonly id: string;
}

export const Heading1: FC<Heading1Props> = ({ children, id }) => (
  // h{id} is because of css query selectors, dont remove the h
  <h2 id={`h${id}`} css={styles}>
    {children}
  </h2>
);
