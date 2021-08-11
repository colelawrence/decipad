import { css } from '@emotion/react';
import { PlatePluginComponent } from '@udecode/plate';
import { p16Regular } from '../../../../primitives';

const styles = css(p16Regular, {
  padding: '8px 0',
});

export const ParagraphElement: PlatePluginComponent = ({
  attributes,
  children,
  nodeProps,
}) => {
  const root = nodeProps!.styles.root;
  return (
    <p css={[styles, root.css]} {...attributes} {...nodeProps}>
      {children}
    </p>
  );
};
