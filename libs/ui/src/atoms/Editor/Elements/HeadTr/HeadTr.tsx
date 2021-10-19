import { css } from '@emotion/react';
import { ComponentProps, FC } from 'react';
import { noop } from '../../../../utils/props';

const trStyles = css({
  border: '1px solid #ECF0F6',
  borderCollapse: 'collapse',
  fontSize: '14px',
});

interface HeadTrElementProps {
  readonly onAddColumn?: () => void;
}

export const HeadTrElement = ({
  children,
  onAddColumn = noop,
  ...props
}: ComponentProps<'tr'> & HeadTrElementProps): ReturnType<FC> => {
  return (
    <tr css={trStyles} {...props}>
      {children}
      <th>
        <button onClick={onAddColumn}>+ Add Column</button>
      </th>
    </tr>
  );
};
