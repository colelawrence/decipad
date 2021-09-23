import { css } from '@emotion/react';
import { PlatePluginComponent } from '@udecode/plate';
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
  attributes,
  nodeProps,
  onRemove = noop,
}: ComponentProps<PlatePluginComponent> &
  BodyTrElementProps): ReturnType<FC> => {
  return (
    <tr css={trStyles} {...attributes} {...nodeProps}>
      {children}
      <td contentEditable={false}>
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
