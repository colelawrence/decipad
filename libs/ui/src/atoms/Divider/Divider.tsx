import { css } from '@emotion/react';
import { cssVar } from '../../primitives';

const styles = css({
  height: '1px',
  border: 'none',
  backgroundColor: cssVar('highlightColor'),
});

export const Divider = (): ReturnType<React.FC> => <hr css={styles} />;
