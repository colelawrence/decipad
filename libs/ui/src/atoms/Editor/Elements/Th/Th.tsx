import { css } from '@emotion/react';
import { PlatePluginComponent } from '@udecode/plate';

const columnStyles = css({
  fontWeight: 'normal',
  padding: '12px',
  textAlign: 'left',
  backgroundColor: '#F5F7FA',
  fontSize: '14px',
  color: '#4D5664',
});

export const ThElement: PlatePluginComponent = ({
  attributes,
  nodeProps,
  children,
}) => {
  return (
    <th css={columnStyles} {...attributes} {...nodeProps}>
      {children}
    </th>
  );
};
