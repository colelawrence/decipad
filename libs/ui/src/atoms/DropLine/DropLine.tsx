import { css } from '@emotion/react';
import { blue300 } from '../../primitives';

const styles = css({
  height: '2px',
  borderRadius: '4px',
  backgroundColor: blue300.rgb,
});

export const DropLine = (): ReturnType<React.FC> => (
  <hr role="presentation" css={styles} />
);
