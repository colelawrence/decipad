/* eslint decipad/css-prop-named-variable: 0 */
import { CellValueType } from '@decipad/editor-types';
import { SerializedType, tokenRules } from '@decipad/language';
import { noop } from '@decipad/utils';
import { ComponentProps, ReactNode, useCallback } from 'react';
import { MenuItem, TriggerMenuItem } from '../../atoms';
import {
  Calendar,
  DollarCircle,
  Move,
  Number as NumberIcon,
  Shapes,
  TableSmall,
  Telescope,
  Text,
} from '../../icons';
import { InputMenuItem, MenuList } from '../../molecules';
import { getDateType, getNumberType, getStringType } from '../../utils';
import { MagnifyingGlass } from '../../icons/MagnifyingGlass/MagnifyingGlass';
import { IdentifiedError, IdentifiedResult } from '@decipad/computer';
import { CodeResult } from '@decipad/ui';
import { css } from '@emotion/react';
import { ResultFormatting } from '../../types';

type VariableEditorMenuProps = {
  readonly type?: CellValueType;
  readonly onChangeType?: (
    type: SerializedType | 'smart-selection' | undefined
  ) => void;
  readonly trigger: ReactNode;
  readonly smartSelection?: boolean;
  readonly lineResult?: IdentifiedResult | IdentifiedError;
} & (
  | {
      // By marking this variant as optional, when not provided it will be assumed as the default.
      readonly variant?: 'expression' | 'toggle' | 'date' | 'dropdown';
      readonly onChangeMax?: never;
      readonly onChangeMin?: never;
      readonly onChangeStep?: never;
      readonly onChangeFormatting?: never;
      readonly max?: never;
      readonly min?: never;
      readonly step?: never;
      readonly formatting?: never;
    }
  | {
      readonly variant?: 'slider';
      readonly onChangeMax?: ComponentProps<typeof InputMenuItem>['onChange'];
      readonly onChangeMin?: ComponentProps<typeof InputMenuItem>['onChange'];
      readonly onChangeStep?: ComponentProps<typeof InputMenuItem>['onChange'];
      readonly onChangeFormatting?: never;
      readonly max?: string;
      readonly min?: string;
      readonly step?: string;
      readonly formatting?: never;
    }
  | {
      readonly variant?: 'display';
      readonly onChangeMax?: never;
      readonly onChangeMin?: never;
      readonly onChangeStep?: never;
      readonly onChangeFormatting?: ComponentProps<
        typeof InputMenuItem
      >['onChange'];
      readonly max?: never;
      readonly min?: never;
      readonly step?: never;
      readonly formatting?: ResultFormatting;
    }
);

type Variant = Pick<VariableEditorMenuProps, 'variant'>['variant'];

const multiLineItemStyles = css({
  display: 'flex',
  flexDirection: 'column',
});

// eslint-disable-next-line complexity
export const VariableEditorMenu: React.FC<VariableEditorMenuProps> = ({
  onChangeMax,
  onChangeMin,
  onChangeStep,
  onChangeFormatting,
  type,
  lineResult,
  onChangeType = noop,
  max,
  min,
  step,
  trigger,
  variant = 'expression',
  formatting,
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
              icon={<TableSmall />}
              onSelect={onSmartSelection}
              selected={smartSelection}
            >
              From existing column
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
      {variant === 'display' && (
        <MenuList
          itemTrigger={
            <TriggerMenuItem
              disabled={!isDisplayFormattingEnabled(variant, type)}
              icon={<Shapes />}
            >
              <div css={{ minWidth: '132px' }}>Number Format</div>
            </TriggerMenuItem>
          }
        >
          <MenuItem
            icon={<Move />}
            onSelect={() =>
              typeof onChangeFormatting === 'function' &&
              onChangeFormatting('automatic')
            }
            selected={formatting === 'automatic'}
          >
            <div css={{ minWidth: '144px' }}>
              <div css={multiLineItemStyles}>
                <span css={{ marginTop: -1 }}>Automatic</span>
                {lineResult?.result && (
                  <span css={{ fontStyle: 'italic' }}>
                    <CodeResult {...lineResult.result} formatting="automatic" />
                  </span>
                )}
              </div>
            </div>
          </MenuItem>
          <MenuItem
            icon={<MagnifyingGlass />}
            onSelect={() =>
              typeof onChangeFormatting === 'function' &&
              onChangeFormatting('precise')
            }
            selected={formatting === 'precise'}
          >
            <div css={{ minWidth: '144px' }}>
              <div css={multiLineItemStyles}>
                <span css={{ marginTop: -1 }}>Precise</span>
                {lineResult?.result && (
                  <span css={{ fontStyle: 'italic' }}>
                    <CodeResult {...lineResult.result} formatting="precise" />
                  </span>
                )}
              </div>
            </div>
          </MenuItem>
          <MenuItem
            icon={<DollarCircle />}
            onSelect={() =>
              typeof onChangeFormatting === 'function' &&
              onChangeFormatting('financial')
            }
            selected={formatting === 'financial'}
          >
            <div css={{ minWidth: '144px' }}>
              <div css={multiLineItemStyles}>
                <span css={{ marginTop: -1 }}>Financial</span>
                {lineResult?.result && (
                  <span css={{ fontStyle: 'italic' }}>
                    <CodeResult {...lineResult.result} formatting="financial" />
                  </span>
                )}
              </div>
            </div>
          </MenuItem>
          <MenuItem
            icon={<Telescope />}
            onSelect={() =>
              typeof onChangeFormatting === 'function' &&
              onChangeFormatting('scientific')
            }
            selected={formatting === 'scientific'}
          >
            <div css={{ minWidth: '144px' }}>
              <div css={multiLineItemStyles}>
                <span css={{ marginTop: -1 }}>Scientific</span>
                {lineResult?.result && (
                  <span css={{ fontStyle: 'italic' }}>
                    <CodeResult
                      {...lineResult.result}
                      formatting="scientific"
                    />
                  </span>
                )}
              </div>
            </div>
          </MenuItem>
        </MenuList>
      )}
    </MenuList>
  );
};

function isDisplayFormattingEnabled(
  variant: Variant,
  type: CellValueType | undefined
): boolean {
  return (
    variant === 'display' &&
    type?.kind === 'number' &&
    type.numberFormat !== 'percentage'
  );
}
