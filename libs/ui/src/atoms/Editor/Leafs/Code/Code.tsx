import { css } from '@emotion/react';
import { PlatePluginComponent } from '@udecode/plate';
import { code, cssVar } from '../../../../primitives';

const codeStyles = css(code, {
  borderRadius: '100vh',
  backgroundColor: cssVar('highlightColor'),
  padding: '6px 12px',
  margin: '0 6px',
});

export const CodeLeaf: PlatePluginComponent = ({ attributes, children }) => {
  return (
    <code css={codeStyles} {...attributes}>
      {children}
    </code>
  );
};
