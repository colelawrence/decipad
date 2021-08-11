import { css } from '@emotion/react';
import { PlatePluginComponent } from '@udecode/plate';
import { cssVar, display } from '../../../../primitives';

const styles = css(display, {
  borderBottom: '1px solid',
  borderColor: cssVar('highlightColor'),
  paddingBottom: '24px',
  marginBottom: '16px',
});

export const TitleElement: PlatePluginComponent = ({
  attributes,
  children,
  nodeProps,
}) => {
  const root = nodeProps!.styles.root;
  return (
    <h1 css={[styles, root.css]} {...attributes} {...nodeProps}>
      {children}
    </h1>
  );
};
