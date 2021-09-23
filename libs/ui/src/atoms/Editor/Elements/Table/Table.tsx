import { css } from '@emotion/react';
import { PlatePluginComponent } from '@udecode/plate';
import { AddRowButton } from './AddRowButton';

const tableStyles = css({
  width: '100%',
  borderCollapse: 'collapse',
  borderRadius: '6px',
  fontFamily: 'monospace',
});

export const TableElement: PlatePluginComponent = ({
  attributes,
  children,
  nodeProps,
}) => {
  return (
    <div>
      <table css={tableStyles} {...attributes} {...nodeProps}>
        {children}
      </table>

      <AddRowButton />
    </div>
  );
};
