import { FC } from 'react';
import { atoms, organisms } from '@decipad/ui';
import { Result, SerializedType } from '@decipad/computer';
import { ValueCell } from '../../types';

interface PowerHeaderProps {
  type?: SerializedType;
  value?: ValueCell;
  rowSpan?: number;
  colSpan?: number;
  onHover: (hover: boolean) => void;
  hover: boolean;
}

export const PowerHeader: FC<PowerHeaderProps> = ({
  type,
  value,
  rowSpan = 1,
  colSpan = 1,
  onHover,
  hover,
}) => {
  if (type == null || value == null) {
    return null;
  }

  return (
    <atoms.PowerHeader
      hover={hover}
      rowSpan={rowSpan}
      colSpan={colSpan}
      onHover={onHover}
    >
      <organisms.CodeResult
        value={value as Result.Result['value']}
        variant="inline"
        type={type}
      />
    </atoms.PowerHeader>
  );
};
