/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, InputHTMLAttributes } from 'react';
import { MenuItem, Tooltip } from '../../atoms';
import { cssVar, p13Medium, red200 } from '../../primitives';
import { menu } from '../../styles';

const menuItemStyles = css({
  background: cssVar('backgroundMain'),

  alignItems: 'center',
  display: 'flex',
  gap: '6px',

  // Overlap MenuItem's background hover color effect. This component is the
  // exception to that background hover effect.
  margin: `calc(-1 * ${menu.itemPadding})`,
  padding: `0 ${menu.itemPadding}`,

  cursor: 'initial',
});

const labelStyles = css({
  flex: '1 1 0px',
});

const inputStyles = css(p13Medium, {
  ':focus-within': {},

  border: `1px solid ${cssVar('borderSubdued')}`,
  borderRadius: '6px',
  '*:hover > &, :focus': {
    borderColor: `${cssVar('borderSubdued')}`,
  },

  padding: '4px 12px',
  margin: '2px 0',

  width: 0, // Override vendor default width so flex basis can apply
  flex: '0 1 100%',

  background: cssVar('backgroundDefault'),
});

const errorInputStyles = css({
  borderColor: red200.rgb,
  '*:hover > &, :focus': {
    borderColor: red200.rgb,
  },
});

interface InputMenuItemProps {
  readonly error?: string;
  readonly label?: string;
  readonly onChange?: (value: string) => void;
  readonly pattern?: InputHTMLAttributes<HTMLInputElement>['pattern'];
  readonly placeholder?: InputHTMLAttributes<HTMLInputElement>['placeholder'];
  readonly type?: InputHTMLAttributes<HTMLInputElement>['type'];
  readonly value?: InputHTMLAttributes<HTMLInputElement>['value'];
}

export const InputMenuItem = ({
  error,
  label,
  onChange = noop,
  pattern,
  placeholder,
  type = 'text',
  value,
}: InputMenuItemProps): ReturnType<FC> => {
  const input = (
    <input
      css={[inputStyles, error && errorInputStyles]}
      onClick={(e) => {
        // Prevent propagation to the MenuItem which will try to select itself
        // as an option and close the dropdown
        e.stopPropagation();
      }}
      onChange={(e) => onChange(e.target.value)}
      pattern={pattern}
      placeholder={placeholder}
      type={type}
      value={value}
    />
  );

  return (
    <MenuItem
      onPointerMove={(e) => {
        // Prevents MenuItem to loose focus in some scenarios.
        e.preventDefault();
      }}
    >
      <div css={menuItemStyles}>
        {label && <span css={labelStyles}>{label}</span>}
        {/* Tooltip is always rendered and explicitly set to not opened when
            there's no error to avoid changing the DOM tree and losing focus on
            the input */}
        <Tooltip open={error ? undefined : false} trigger={input}>
          <p>{error}</p>
        </Tooltip>
      </div>
    </MenuItem>
  );
};
