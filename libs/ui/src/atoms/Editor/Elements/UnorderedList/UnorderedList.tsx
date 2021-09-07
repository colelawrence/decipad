import { css } from '@emotion/react';
import { PlatePluginComponent } from '@udecode/plate';

const listStyles = css({
  listStyleType: 'disc',
  paddingLeft: '1.25rem',
  lineHeight: '1.75',
});

export const UnorderedListElement: PlatePluginComponent = ({
  children,
  attributes,
}) => {
  return (
    <ul css={listStyles} {...attributes}>
      {children}
    </ul>
  );
};
