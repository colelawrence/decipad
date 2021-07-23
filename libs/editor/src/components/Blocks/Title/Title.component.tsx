import { css } from '@emotion/react';
import { SlatePluginComponent } from '@udecode/slate-plugins-core';

const h1Styles = css({
  fontSize: '2rem',
  margin: 0,
  paddingBottom: '2rem',
  marginBottom: '16px',
  borderBottom: '1px solid #f0f0f2',
  fontWeight: 'bold',
  color: '#121214',
  '& ::selection': {
    backgroundColor: 'rgba(196, 202, 251, 0.5)',
  },
});

export const Title: SlatePluginComponent = ({
  attributes,
  children,
  nodeProps,
}) => {
  const root = nodeProps!.styles.root;
  return (
    <h1 css={[h1Styles, root.css]} {...attributes} {...nodeProps}>
      {children}
    </h1>
  );
};
