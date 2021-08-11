import { css } from '@emotion/react';
import { PlatePluginComponent } from '@udecode/plate';
import {
  blockquote,
  cssVar,
  p16Regular,
  setCssVar,
} from '../../../../primitives';

const styles = css(p16Regular, {
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
  borderLeft: `5px solid ${blockquote.rgb}`,
  padding: '8px 24px',
  margin: '16px 0',
});

export const BlockquoteElement: PlatePluginComponent = ({
  attributes,
  children,
}) => {
  return (
    <blockquote css={styles} {...attributes}>
      {children}
    </blockquote>
  );
};
