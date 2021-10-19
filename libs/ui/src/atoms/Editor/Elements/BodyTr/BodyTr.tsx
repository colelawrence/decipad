import { css } from '@emotion/react';
import { ComponentProps, FC } from 'react';
import { noop } from '../../../../utils/props';

const trStyles = css({
  border: '1px solid #ECF0F6',
  borderCollapse: 'collapse',
  fontSize: '14px',
  textAlign: 'center',
});

interface BodyTrElementProps {
  readonly onRemove?: () => void;
}

export const BodyTrElement = ({
  children,
  onRemove = noop,
  ...props
}: ComponentProps<'tr'> & BodyTrElementProps): ReturnType<FC> => {
  return (
    <tr css={trStyles} {...props}>
      {children}
      <td>
        <button
          onClick={(event) => {
            onRemove();
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          - Remove Row
        </button>
      </td>
    </tr>
  );
};
