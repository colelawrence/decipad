import { css } from '@emotion/react';
import { PlatePluginComponent } from '@udecode/plate';

const styles = css({
  textDecoration: 'underline',
});

export const UnderlineLeaf: PlatePluginComponent = ({
  attributes,
  children,
}) => {
  return (
    <span css={styles} {...attributes}>
      {children}
    </span>
  );
};
