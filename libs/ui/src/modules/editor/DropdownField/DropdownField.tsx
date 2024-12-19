/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { ReactNode, useId } from 'react';
import { MenuList } from '../../../shared';
import {
  cssVar,
  inputLabel,
  p13Medium,
  errorStyles,
} from 'libs/ui/src/primitives';
import { CaretDown } from 'libs/ui/src/icons';

const iconWrapperStyles = (squareIcon: boolean) =>
  css({
    display: 'grid',
    alignItems: 'center',
    width: squareIcon ? '16px' : undefined,
    height: '16px',
    flexShrink: 0,
  });

const triggerStyles = css([
  p13Medium,
  {
    width: '100%',
    height: '32px',
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: `1px solid ${cssVar('borderSubdued')}`,
    borderRadius: '6px',
    backgroundColor: cssVar('backgroundMain'),
    textOverflow: 'ellipsis',

    ':hover, :focus-visible': {
      backgroundColor: cssVar('backgroundSubdued'),
    },

    '&[data-no-value-selected="true"]': {
      color: cssVar('textDisabled'),
    },

    '&[aria-disabled="true"]': {
      backgroundColor: cssVar('backgroundSubdued'),
      color: cssVar('textDisabled'),
      cursor: 'not-allowed',
    },
  },
]);

const triggerTextStyles = css({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  textWrap: 'nowrap',
  textAlign: 'left',
  /**
   * flexGrow: 1 and width: 0 prevents the parent container from resizing when
   * the text is too long.
   */
  flexGrow: 1,
  width: 0,
});

const containerStyles = css({
  display: 'grid',
  gap: '0px 8px',
  gridTemplateColumns: 'auto 1fr ',
  gridTemplateRows: 'auto auto',
  gridTemplateAreas: `
    "label error"
    "input input";
  `,
});

interface DropdownFieldProps {
  readonly label?: ReactNode;
  readonly icon?: ReactNode;
  readonly squareIcon?: boolean;
  readonly triggerText: string;
  readonly children: ReactNode;
  readonly error?: string;
  readonly noValueSelected?: boolean;
}

export const DropdownField = ({
  label,
  icon,
  squareIcon,
  triggerText,
  children,
  error,
  noValueSelected,
}: DropdownFieldProps) => {
  const id = `dropdown-${useId()}`;
  const errorEl = error ? <span css={errorStyles}>{error}</span> : null;

  return (
    <div css={containerStyles}>
      {label && <DropdownFieldLabel id={id}>{label}</DropdownFieldLabel>}
      {errorEl}
      <div css={css({ gridArea: 'input' })}>
        <MenuList
          root
          dropdown
          trigger={
            <div>
              <DropdownFieldTrigger
                id={id}
                icon={icon}
                squareIcon={squareIcon}
                noValueSelected={noValueSelected}
              >
                {triggerText}
              </DropdownFieldTrigger>
            </div>
          }
          sideOffset={4}
          styles={css({ width: 'var(--radix-popper-anchor-width)' })}
        >
          {children}
        </MenuList>
      </div>
    </div>
  );
};

export interface DropdownFieldLabelProps {
  readonly id: string;
  readonly children: ReactNode;
}

export const DropdownFieldLabel = ({
  id,
  children,
}: DropdownFieldLabelProps) => (
  <label htmlFor={id} css={[inputLabel, { display: 'block' }]}>
    {children}
  </label>
);

export interface DropdownFieldTriggerProps {
  readonly id: string;
  readonly icon?: ReactNode;
  readonly squareIcon?: boolean;
  readonly children: string;
  readonly noValueSelected?: boolean;
  readonly disabled?: boolean;
}

export const DropdownFieldTrigger = ({
  id,
  icon,
  squareIcon = true,
  children,
  noValueSelected,
  disabled = false,
}: DropdownFieldTriggerProps) => (
  <button
    id={id}
    type="button"
    css={triggerStyles}
    aria-disabled={disabled}
    data-no-value-selected={noValueSelected || undefined}
  >
    {icon && <span css={iconWrapperStyles(squareIcon)}>{icon}</span>}
    <span css={triggerTextStyles} title={children}>
      {children}
    </span>
    <CaretDown css={{ width: '12px', marginLeft: 'auto', flexShrink: 0 }} />
  </button>
);
