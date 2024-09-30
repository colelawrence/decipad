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
  readonly label?: string;
  readonly icon?: ReactNode;
  readonly squareIcon?: boolean;
  readonly triggerText: string;
  readonly children: ReactNode;
}

export const DropdownField = ({
  label,
  icon,
  squareIcon = true,
  triggerText,
  children,
}: DropdownFieldProps) => {
  const id = `dropdown-${useId()}`;

  const labelEl = label && (
    <label htmlFor={id} css={[inputLabel, { display: 'block' }]}>
      {label}
    </label>
  );

  return (
    <div>
      {labelEl}
      <MenuList
        root
        dropdown
        trigger={
          <button id={id} type="button" css={triggerStyles}>
            {icon && <span css={iconWrapperStyles(squareIcon)}>{icon}</span>}
            {triggerText}
            <CaretDown css={{ width: '12px', marginLeft: 'auto' }} />
          </button>
        }
        sideOffset={4}
        styles={css({ width: 'var(--radix-popper-anchor-width)' })}
      >
        {children}
      </MenuList>
    </div>
  );
};
