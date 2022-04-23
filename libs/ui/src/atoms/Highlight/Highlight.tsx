import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { highlight } from '../../styles';

const styles = css(highlight.highlightStyles, {
  borderRadius: '4px',
});

interface HighlightProps {
  readonly children: ReactNode;
}
export const Highlight = ({
  children,
}: HighlightProps): ReturnType<React.FC> => {
  return <span css={styles}>{children}</span>;
};
