import { Hide, Show } from 'libs/ui/src/icons';
import { MenuItem } from 'libs/ui/src/shared';
import { FC } from 'react';

type HideColumnProps = {
  isColumnHidden: boolean;
  onToggleColumn: () => void;
};

export const HideColumn: FC<HideColumnProps> = ({
  isColumnHidden,
  onToggleColumn,
}) => {
  if (isColumnHidden) {
    return (
      <MenuItem key="show-column" icon={<Show />} onSelect={onToggleColumn}>
        Show Column
      </MenuItem>
    );
  }
  return (
    <MenuItem key="hide-column" icon={<Hide />} onSelect={onToggleColumn}>
      Hide Column
    </MenuItem>
  );
};
