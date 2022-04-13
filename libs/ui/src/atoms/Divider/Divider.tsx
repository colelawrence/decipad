import { css } from '@emotion/react';
import { cssVar } from '../../primitives';
import { divider } from '../../styles/block-alignment';

const styles = css({
  border: 'none',
  boxShadow: `0 0 0 0.5px ${cssVar('strongHighlightColor')}`,
  margin: `${divider.paddingTop} 0`,
});

export const Divider = (): ReturnType<React.FC> => (
  <div>
    <hr css={styles} />
  </div>
);
