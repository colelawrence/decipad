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
  // TODO type root better and make optional
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { root } = nodeProps!.styles;
  return (
    <p css={[styles, root.css]} {...attributes} {...nodeProps}>
      {children}
    </p>
  );
};
