import { ComponentProps, ReactNode, useState } from 'react';
import { noop } from '@decipad/utils';
import { isFlagEnabled } from '@decipad/feature-flags';
import { SerializedType, tokenRules } from '@decipad/language';
import { MenuItem, MenuSeparator, TriggerMenuItem } from '../../atoms';
import { InputMenuItem, MenuList } from '../../molecules';
import {
  Calendar,
  CheckboxSelected,
  Close,
  Formula,
  Number as NumberIcon,
  Shapes,
  Text,
} from '../../icons';
import {
  getBooleanType,
  getDateType,
  getNumberType,
  getStringType,
} from '../../utils';

type VariableEditorMenuProps = {
  readonly onCopy?: () => void;
  readonly onDelete?: () => void;
  readonly type?: SerializedType;
  readonly onChangeType?: (type: SerializedType | undefined) => void;
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
  type,
  onChangeType = noop,
  max,
  min,
  step,
  trigger,
  variant = 'expression',
}) => {
  const [dateOpen, setDateOpen] = useState(false);
  return (
    <MenuList root dropdown trigger={trigger}>
      {variant === 'slider' && [
        <InputMenuItem
          error={
            max != null && min != null && Number(min) > Number(max)
              ? `Must be lower than ${max}`
              : undefined
          }
          key="min"
          label="Minimum"
          onChange={onChangeMin}
          pattern={tokenRules.main.number.match.source}
          value={min}
        />,
        <InputMenuItem
          error={
            max != null && min != null && Number(max) < Number(min)
              ? `Must be bigger than ${min}`
              : undefined
          }
          key="max"
          label="Maximum"
          onChange={onChangeMax}
          pattern={tokenRules.main.number.match.source}
          value={max}
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
          pattern={tokenRules.main.number.match.source}
          value={step}
        />,
        <MenuSeparator key="sep" />,
      ]}
      <MenuList
        itemTrigger={
          <TriggerMenuItem icon={<Shapes />}>
            <div css={{ minWidth: '132px' }}>Change type</div>
          </TriggerMenuItem>
        }
      >
        <MenuItem
          icon={<NumberIcon />}
          onSelect={() => onChangeType(getNumberType())}
          selected={type?.kind === 'number' && type.unit == null}
        >
          Number
        </MenuItem>
        <MenuItem
          icon={<Formula />}
          onSelect={() => onChangeType({ kind: 'anything' })}
          selected={type?.kind === 'anything'}
        >
          Formula
        </MenuItem>
        <MenuItem
          icon={<CheckboxSelected />}
          onSelect={() => onChangeType(getBooleanType())}
          selected={type?.kind === 'boolean'}
        >
          Checkbox
        </MenuItem>
        <MenuItem
          icon={<Text />}
          onSelect={() => onChangeType(getStringType())}
          selected={type?.kind === 'string'}
        >
          Text
        </MenuItem>
        <MenuList
          itemTrigger={
            <TriggerMenuItem
              icon={<Calendar />}
              selected={type?.kind === 'date'}
            >
              <div css={{ minWidth: '116px' }}>Date</div>
            </TriggerMenuItem>
          }
          open={dateOpen}
          onChangeOpen={setDateOpen}
        >
          <MenuItem
            icon={<Calendar />}
            onSelect={() => onChangeType(getDateType('year'))}
            selected={type?.kind === 'date' && type.date === 'year'}
          >
            Year
          </MenuItem>
          <MenuItem
            icon={<Calendar />}
            onSelect={() => onChangeType(getDateType('month'))}
            selected={type?.kind === 'date' && type.date === 'month'}
          >
            Month
          </MenuItem>
          <MenuItem
            icon={<Calendar />}
            onSelect={() => onChangeType(getDateType('day'))}
            selected={type?.kind === 'date' && type.date === 'day'}
          >
            Day
          </MenuItem>
          <MenuItem
            icon={<Calendar />}
            onSelect={() => onChangeType(getDateType('minute'))}
            selected={type?.kind === 'date' && type.date === 'minute'}
          >
            Time
          </MenuItem>
        </MenuList>
        {type && (
          <MenuItem
            icon={<Close />}
            onSelect={() => onChangeType(undefined)}
            selected={!type}
          >
            Reset
          </MenuItem>
        )}
      </MenuList>
      {isFlagEnabled('INPUT_COPY') && (
        <MenuItem onSelect={onCopy}>Copy</MenuItem>
      )}

      <MenuItem onSelect={onDelete}>
        <div css={{ minWidth: '165px' }}>Delete</div>
      </MenuItem>
    </MenuList>
  );
};
