import { css } from '@emotion/react';
import { PlatePluginComponent } from '@udecode/plate';
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
  attributes,
  nodeProps,
  onAddColumn = noop,
}: ComponentProps<PlatePluginComponent> &
  HeadTrElementProps): ReturnType<FC> => {
  return (
    <tr css={trStyles} {...attributes} {...nodeProps}>
      {children}
      <th contentEditable={false}>
        <button onClick={onAddColumn}>+ Add Column</button>
      </th>
    </tr>
  );
};
