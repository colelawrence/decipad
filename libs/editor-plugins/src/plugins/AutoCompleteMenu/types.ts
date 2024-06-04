import type { ComponentProps } from 'react';
import type {
  AutoCompleteMenuProps,
  AutoCompleteMenu as UIAutoCompleteMenu,
} from '@decipad/ui';

export interface AutoCompletePlugin {
  mode?: AutoCompleteMenuProps['mode'];
}

export type MenuItem = Parameters<
  NonNullable<ComponentProps<typeof UIAutoCompleteMenu>['onExecuteItem']>
>[0];
