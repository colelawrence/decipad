import { css } from '@emotion/react';
import { SlatePluginComponent } from '@udecode/slate-plugins';

const pStyles = css({
  lineHeight: '1.75',
  color: '#3E3E42',
  padding: '8px 0',
  position: 'relative',
  '& ::selection': {
    backgroundColor: 'rgba(196, 202, 251, 0.5)',
  },
});

export const Paragraph: SlatePluginComponent = ({
  attributes,
  children,
  nodeProps,
}) => {
  const root = nodeProps!.styles.root;
  return (
    <p css={[pStyles, root.css]} {...attributes} {...nodeProps}>
      {children}
    </p>
  );
};
