import { css } from '@emotion/react';
import { PlatePluginComponent } from '@udecode/plate';
import { h1 } from '../../../../primitives';

const styles = css(h1, {
  padding: '16px 0',
});

export const SubtitleElement: PlatePluginComponent = ({
  attributes,
  children,
}) => {
  return (
    <h2 css={styles} {...attributes}>
      {children}
    </h2>
  );
};
