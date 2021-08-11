import { css } from '@emotion/react';
import { PlatePluginComponent } from '@udecode/plate';
import { h2 } from '../../../../primitives';

const styles = css(h2, {
  padding: '16px 0',
});

export const SubheadingElement: PlatePluginComponent = ({
  attributes,
  children,
}) => {
  return (
    <h3 css={styles} {...attributes}>
      {children}
    </h3>
  );
};
