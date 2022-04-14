import { FC } from 'react';
import * as RadixDropdown from '@radix-ui/react-dropdown-menu';

export const MenuWrapper: FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => (
  <RadixDropdown.Root open>
    <RadixDropdown.Trigger css={{ height: 0 }}>&nbsp;</RadixDropdown.Trigger>
    <RadixDropdown.Content>{children}</RadixDropdown.Content>
  </RadixDropdown.Root>
);
