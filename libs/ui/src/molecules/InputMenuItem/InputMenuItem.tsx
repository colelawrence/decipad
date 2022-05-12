import { FC, InputHTMLAttributes } from 'react';
import { css } from '@emotion/react';
import { noop } from '@decipad/utils';
import { cssVar, p13Medium, setCssVar } from '../../primitives';
import { MenuItem } from '../../atoms';
import { menu } from '../../styles';

const menuItemStyles = css({
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
  background: cssVar('backgroundColor'),

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
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
  ':focus-within': {
    ...setCssVar('currentTextColor', cssVar('normalTextColor')),
  },

  border: `1px solid ${cssVar('strongHighlightColor')}`,
  borderRadius: '6px',
  '*:hover > &, :focus': {
    borderColor: `${cssVar('strongerHighlightColor')}`,
  },

  padding: '4px 12px',
  margin: '2px 0',

  width: 0, // Override vendor default width so flex basis can apply
  flex: '0 1 40%',

  background: cssVar('highlightColor'),
});

interface InputMenuItemProps {
  readonly label?: string;
  readonly onChange?: (value: string) => void;
  readonly placeholder?: string;
  readonly type?: InputHTMLAttributes<HTMLInputElement>['type'];
  readonly value?: InputHTMLAttributes<HTMLInputElement>['value'];
}

export const InputMenuItem = ({
  label,
  onChange = noop,
  placeholder,
  type,
  value,
}: InputMenuItemProps): ReturnType<FC> => {
  return (
    <MenuItem
      onPointerMove={(e) => {
        // Prevents MenuItem to loose focus in some scenarios.
        e.preventDefault();
      }}
    >
      <div css={menuItemStyles}>
        {label && <span css={labelStyles}>{label}</span>}
        <input
          css={inputStyles}
          onClick={(e) => {
            // Prevent propagation to the MenuItem which will try to select itself
            // as an option and close the dropdown
            e.stopPropagation();
          }}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type={type}
          value={value}
        />
      </div>
    </MenuItem>
  );
};
