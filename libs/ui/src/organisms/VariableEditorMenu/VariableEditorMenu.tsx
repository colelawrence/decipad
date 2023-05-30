/* eslint decipad/css-prop-named-variable: 0 */
import { CellValueType } from '@decipad/editor-types';
import { isFlagEnabled } from '@decipad/feature-flags';
import { SerializedType, tokenRules } from '@decipad/language';
import { noop } from '@decipad/utils';
import { ComponentProps, ReactNode, useCallback } from 'react';
import { MenuItem, MenuSeparator, TriggerMenuItem } from '../../atoms';
import {
  Calendar,
  Number as NumberIcon,
  Shapes,
  Table,
  Text,
} from '../../icons';
import { InputMenuItem, MenuList } from '../../molecules';
import { getDateType, getNumberType, getStringType } from '../../utils';

type VariableEditorMenuProps = {
  readonly onCopy?: () => void;
  readonly onDelete?: () => void;
  readonly type?: CellValueType;
  readonly onChangeType?: (
    type: SerializedType | 'smart-selection' | undefined
  ) => void;
  readonly trigger: ReactNode;
  readonly smartSelection?: boolean;
} & (
  | {
      // By marking this variant as optional, when not provided it will be assumed as the default.
      readonly variant?: 'expression' | 'toggle' | 'date' | 'dropdown';
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
  | {
      readonly variant?: 'display';
      readonly onChangeMax?: never;
      readonly onChangeMin?: never;
      readonly onChangeStep?: never;
      readonly max?: never;
      readonly min?: never;
      readonly step?: never;
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
  smartSelection = false,
}) => {
  const onSmartSelection = useCallback(() => {
    onChangeType('smart-selection');
  }, [onChangeType]);

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
          label="Min"
          onChange={(changedMin: string) => {
            typeof onChangeMin === 'function' &&
              onChangeMin(Math.abs(+changedMin).toString());
          }}
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
          label="Max"
          onChange={(changedMax: string) => {
            typeof onChangeMax === 'function' &&
              onChangeMax(Math.abs(+changedMax).toString());
          }}
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
      {variant === 'expression' || variant === 'dropdown' ? (
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
            selected={
              type?.kind === 'number' && type.unit == null && !smartSelection
            }
          >
            Number
          </MenuItem>
          <MenuItem
            icon={<Text />}
            onSelect={() => onChangeType(getStringType())}
            selected={type?.kind === 'string' && !smartSelection}
          >
            Text
          </MenuItem>
          {variant === 'dropdown' && (
            <MenuItem
              icon={<Table />}
              onSelect={onSmartSelection}
              selected={smartSelection}
            >
              Smart Selection
            </MenuItem>
          )}
        </MenuList>
      ) : (
        variant === 'date' && (
          <MenuList
            itemTrigger={
              <TriggerMenuItem icon={<Shapes />}>
                <div css={{ minWidth: '132px' }}>Change type</div>
              </TriggerMenuItem>
            }
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
        )
      )}
      {isFlagEnabled('INPUT_COPY') && (
        <MenuItem onSelect={onCopy}>Copy</MenuItem>
      )}

      <MenuItem onSelect={onDelete}>
        <div css={{ minWidth: '165px' }}>Delete</div>
      </MenuItem>
    </MenuList>
  );
};
