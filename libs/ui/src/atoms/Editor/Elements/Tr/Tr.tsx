import { css } from '@emotion/react';
import { PlatePluginComponent } from '@udecode/plate';

const trStyles = css({
  border: '1px solid #ECF0F6',
  borderCollapse: 'collapse',
  fontSize: '14px',
});

export const TrElement: PlatePluginComponent = ({
  children,
  attributes,
  nodeProps,
}) => {
  return (
    <tr css={trStyles} {...attributes} {...nodeProps}>
      {children}
    </tr>
  );
};
