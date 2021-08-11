import { css } from '@emotion/react';
import { PlatePluginComponent } from '@udecode/plate';

const styles = css({
  textDecoration: 'line-through',
});

export const StrikethroughLeaf: PlatePluginComponent = ({
  attributes,
  children,
}) => {
  return (
    <span css={styles} {...attributes}>
      {children}
    </span>
  );
};
