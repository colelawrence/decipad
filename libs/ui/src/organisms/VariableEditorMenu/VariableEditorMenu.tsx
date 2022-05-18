import { ComponentProps, ReactNode } from 'react';
import { noop } from '@decipad/utils';
import { isEnabled } from '@decipad/feature-flags';
import { MenuItem, MenuSeparator } from '../../atoms';
import { InputMenuItem, MenuList } from '../../molecules';

type VariableEditorMenuProps = {
  readonly onCopy?: () => void;
  readonly onDelete?: () => void;
  readonly trigger: ReactNode;
} & (
  | {
      // By marking this variant as optional, when not provided it will be assumed as the default.
      readonly variant?: 'expression';
      readonly onChangeMax?: never;
      readonly onChangeMin?: never;
      readonly onChangeStep?: never;
    }
  | {
      readonly variant: 'slider';
      readonly onChangeMax?: ComponentProps<typeof InputMenuItem>['onChange'];
      readonly onChangeMin?: ComponentProps<typeof InputMenuItem>['onChange'];
      readonly onChangeStep?: ComponentProps<typeof InputMenuItem>['onChange'];
    }
);

export const VariableEditorMenu: React.FC<VariableEditorMenuProps> = ({
  onChangeMax,
  onChangeMin,
  onChangeStep,
  onCopy = noop,
  onDelete = noop,
  trigger,
  variant = 'expression',
}) => (
  <MenuList root dropdown trigger={trigger}>
    {variant === 'slider' && [
      <InputMenuItem
        key="max"
        label="Maximum value"
        onChange={onChangeMax}
        type="number"
      />,
      <InputMenuItem
        key="min"
        label="Minimim value"
        onChange={onChangeMin}
        type="number"
      />,
      <InputMenuItem
        key="step"
        label="Step"
        onChange={onChangeStep}
        type="number"
      />,
      <MenuSeparator key="sep" />,
    ]}
    {isEnabled('INPUT_COPY') && <MenuItem onSelect={onCopy}>Copy</MenuItem>}
    <MenuItem onSelect={onDelete}>
      <div css={{ minWidth: '165px' }}>Delete</div>
    </MenuItem>
  </MenuList>
);
