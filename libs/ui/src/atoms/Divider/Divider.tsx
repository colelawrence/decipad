import { css } from '@emotion/react';
import { cssVar } from '../../primitives';

const styles = css({
  border: 'none',
  boxShadow: `0 0 0 0.5px ${cssVar('backgroundHeavy')}`,
});

export const Divider = (): ReturnType<React.FC> => <hr css={styles} />;
