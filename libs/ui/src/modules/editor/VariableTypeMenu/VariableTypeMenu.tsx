import { ComponentProps, FC, ReactNode, useState } from 'react';
import { MenuList } from '../../../shared';
import { VariableTypeMenuItems } from './VariableTypeMenuItems';

type VariableTypeMenuProps = Readonly<{
  trigger: ReactNode;
  children?: ReactNode;
}> &
  ComponentProps<typeof VariableTypeMenuItems>;

export const VariableTypeMenu: FC<VariableTypeMenuProps> = ({
  trigger,
  children,
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
      {children}
    </MenuList>
  );
};
