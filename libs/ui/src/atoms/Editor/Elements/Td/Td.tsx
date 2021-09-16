import { css } from '@emotion/react';
import { PlatePluginComponent } from '@udecode/plate';

const tdStyles = css({
  border: '1px solid #ECF0F6',
  borderCollapse: 'collapse',
  fontSize: '14px',
  padding: '12px 12px',
});

export const TdElement: PlatePluginComponent = ({
  attributes,
  nodeProps,
  children,
}) => {
  return (
    <td css={tdStyles} {...attributes} {...nodeProps}>
      {children}
    </td>
  );
};
