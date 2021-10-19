import { css } from '@emotion/react';
import { ComponentProps, FC } from 'react';
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

export const CaptionElement: FC<ComponentProps<'caption'>> = ({
  children,
  ...props
}) => {
  return (
    <caption css={titleStyles} {...props}>
      <div css={tableTitleWrapper}>
        <div css={tableIconSizeStyles}>
          <TableIcon />
        </div>
        {children}
      </div>
    </caption>
  );
};
