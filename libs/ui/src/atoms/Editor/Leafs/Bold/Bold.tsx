import { css } from '@emotion/react';
import { PlatePluginComponent } from '@udecode/plate';

const styles = css({
  fontWeight: 'bold',
});

export const BoldLeaf: PlatePluginComponent = ({ attributes, children }) => {
  return (
    <span css={styles} {...attributes}>
      {children}
    </span>
  );
};
