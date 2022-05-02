import { css } from '@emotion/react';
import { ReactNode } from 'react';
import {
  normalOpacity,
  strongOpacity,
  sun500,
  transparency,
  weakOpacity,
} from '../../primitives';
import { highlight } from '../../styles';

const styles = css(highlight.highlightStyles, {
  borderRadius: '0.9em 0.3em',
  margin: '0 -0.45em',
  padding: '0.15em 0.45em',
  background: 'transparent',
  boxDecorationBreak: 'clone',
  webkitBoxDecorationBreak: 'clone',
  backgroundImage: `linear-gradient(
    to right,
    ${transparency(sun500, weakOpacity).rgba},
    ${transparency(sun500, strongOpacity).rgba} 5%,
    ${transparency(sun500, normalOpacity).rgba}
  )`,
});

interface HighlightProps {
  readonly children: ReactNode;
}
export const Highlight = ({
  children,
}: HighlightProps): ReturnType<React.FC> => {
  return <span css={styles}>{children}</span>;
};
