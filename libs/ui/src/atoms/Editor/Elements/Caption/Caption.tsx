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

const tableIconSizeStyles = css({
  width: '18px',
  height: '18px',
});
const tableTitleWrapper = css({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

export const CaptionElement: PlatePluginComponent = ({
  attributes,
  children,
  nodeProps,
}) => {
  return (
    <caption css={titleStyles} {...attributes} {...nodeProps}>
      <div css={tableTitleWrapper}>
        <div css={tableIconSizeStyles} contentEditable={false}>
          <TableIcon />
        </div>
        {children}
      </div>
    </caption>
  );
};
