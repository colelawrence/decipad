import { ComponentProps, FC, ReactNode, useState } from 'react';
import { MenuList } from '../../../shared';
import { VariableTypeMenuItems } from './VariableTypeMenuItems';

type VariableTypeMenuProps = Readonly<{
  trigger: ReactNode;
}> &
  ComponentProps<typeof VariableTypeMenuItems>;

export const VariableTypeMenu: FC<VariableTypeMenuProps> = ({
  trigger,
  ...props
}) => {
  const [open, setOpen] = useState(false);

  return (
    <MenuList
      root
      dropdown
      open={open}
      onChangeOpen={setOpen}
      trigger={trigger}
    >
      <VariableTypeMenuItems {...props} />
    </MenuList>
  );
};
