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
      readonly max?: never;
      readonly min?: never;
      readonly step?: never;
    }
  | {
      readonly variant?: 'slider';
      readonly onChangeMax?: ComponentProps<typeof InputMenuItem>['onChange'];
      readonly onChangeMin?: ComponentProps<typeof InputMenuItem>['onChange'];
      readonly onChangeStep?: ComponentProps<typeof InputMenuItem>['onChange'];
      readonly max?: string;
      readonly min?: string;
      readonly step?: string;
    }
);

export const VariableEditorMenu: React.FC<VariableEditorMenuProps> = ({
  onChangeMax,
  onChangeMin,
  onChangeStep,
  onCopy = noop,
  onDelete = noop,
  max,
  min,
  step,
  trigger,
  variant = 'expression',
}) => (
  <MenuList root dropdown trigger={trigger}>
    {variant === 'slider' && [
      <InputMenuItem
        error={
          max != null && min != null && Number(max) < Number(min)
            ? `Must be bigger than ${min}`
            : undefined
        }
        key="max"
        label="Maximum value"
        onChange={onChangeMax}
        type="number"
        value={max}
      />,
      <InputMenuItem
        error={
          max != null && min != null && Number(min) > Number(max)
            ? `Must be lower than ${max}`
            : undefined
        }
        key="min"
        label="Minimum value"
        onChange={onChangeMin}
        type="number"
        value={min}
      />,
      <InputMenuItem
        error={
          max != null && min != null && step != null
            ? Math.abs(Number(min) - Number(max)) < Number(step)
              ? `Must be lower than ${Math.abs(Number(min) - Number(max))}`
              : Number(step) <= 0
              ? 'Must be bigger than 0'
              : undefined
            : undefined
        }
        key="step"
        label="Step"
        onChange={onChangeStep}
        type="number"
        value={step}
      />,
      <MenuSeparator key="sep" />,
    ]}
    {isEnabled('INPUT_COPY') && <MenuItem onSelect={onCopy}>Copy</MenuItem>}
    <MenuItem onSelect={onDelete}>
      <div css={{ minWidth: '165px' }}>Delete</div>
    </MenuItem>
  </MenuList>
);
