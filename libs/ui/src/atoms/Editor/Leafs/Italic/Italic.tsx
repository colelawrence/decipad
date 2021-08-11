import { css } from '@emotion/react';
import { PlatePluginComponent } from '@udecode/plate';

const styles = css({
  fontStyle: 'italic',
});

export const ItalicLeaf: PlatePluginComponent = ({ attributes, children }) => {
  return (
    <span css={styles} {...attributes}>
      {children}
    </span>
  );
};
