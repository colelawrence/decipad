import { css } from '@emotion/react';
import { PlatePluginComponent } from '@udecode/plate';
import { Table as TableIcon } from '../../../../icons';

const titleStyles = css({
  fontWeight: 'bold',
  padding: '16px 12px',
  border: '1px solid #fff',
  backgroundColor: '#fff',
  fontSize: '18px',
  color: '#161e2c',
});

const columnStyles = css({
  fontWeight: 'normal',
  padding: '12px',
  textAlign: 'left',
  backgroundColor: '#F5F7FA',
  fontSize: '14px',
  color: '#4D5664',
});

const tableTitleWrapper = css({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const tableIconSize = css({
  width: '18px',
  height: '18px',
});

export const ThElement: PlatePluginComponent = ({
  attributes,
  nodeProps,
  children,
  element,
}) => {
  const title = !!(element && element.attributes && element.attributes.title);
  return (
    <th
      css={[columnStyles, title && titleStyles]}
      {...attributes}
      {...nodeProps}
    >
      <div css={tableTitleWrapper}>
        {title && (
          <div css={tableIconSize} contentEditable={false}>
            <TableIcon />
          </div>
        )}
        {children}
      </div>
    </th>
  );
};
