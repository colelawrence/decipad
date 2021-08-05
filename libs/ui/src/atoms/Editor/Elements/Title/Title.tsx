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
  // TODO type root better and make optional
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { root } = nodeProps!.styles;
  return (
    <h1 css={[styles, root.css]} {...attributes} {...nodeProps}>
      {children}
    </h1>
  );
};
