/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { ReactNode, useId } from 'react';
import { MenuList } from '../../../shared';
import { cssVar, inputLabel, p13Medium } from 'libs/ui/src/primitives';
import { CaretDown } from 'libs/ui/src/icons';

const iconWrapperStyles = (squareIcon: boolean) =>
  css({
    display: 'grid',
    alignItems: 'center',
    width: squareIcon ? '16px' : undefined,
    height: '16px',
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

    ':hover, :focus-visible': {
      backgroundColor: cssVar('backgroundSubdued'),
    },
  },
]);

interface DropdownFieldProps {
  readonly label?: ReactNode;
  readonly icon?: ReactNode;
  readonly squareIcon?: boolean;
  readonly triggerText: ReactNode;
  readonly children: ReactNode;
}

export const DropdownField = ({
  label,
  icon,
  squareIcon,
  triggerText,
  children,
}: DropdownFieldProps) => {
  const id = `dropdown-${useId()}`;

  return (
    <div>
      {label && <DropdownFieldLabel id={id}>{label}</DropdownFieldLabel>}
      <MenuList
        root
        dropdown
        trigger={
          <div>
            <DropdownFieldTrigger id={id} icon={icon} squareIcon={squareIcon}>
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
  readonly children: ReactNode;
}

export const DropdownFieldTrigger = ({
  id,
  icon,
  squareIcon = true,
  children,
}: DropdownFieldTriggerProps) => (
  <button id={id} type="button" css={triggerStyles}>
    {icon && <span css={iconWrapperStyles(squareIcon)}>{icon}</span>}
    {children}
    <CaretDown css={{ width: '12px', marginLeft: 'auto' }} />
  </button>
);
