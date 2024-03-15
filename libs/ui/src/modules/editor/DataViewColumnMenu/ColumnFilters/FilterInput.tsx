import { css } from '@emotion/react';
import { FC, useRef } from 'react';
import { MenuItem } from '../../../../shared';
import { cssVar, p13Medium } from '../../../../primitives';
import { menu } from '../../../../styles';
import { noop } from '@decipad/utils';

const menuItemStyles = css({
  background: cssVar('backgroundMain'),
  border: `1px solid ${cssVar('borderSubdued')}`,
  borderRadius: '6px',
  ':hover, :focus-within': {
    borderColor: `${cssVar('borderSubdued')}`,
  },

  display: 'flex',

  margin: `calc(-1 * ${menu.itemPadding})`,
});

const inputStyles = css(p13Medium, {
  ':focus-within': {},
  background: cssVar('backgroundDefault'),
  borderRadius: '6px',
  padding: '6px 10px',
});

const outerStyle = css(p13Medium, {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  justifyContent: 'space-between',
});
interface FilterInputProps {
  readonly value?: number | string | undefined;
  readonly onSelect?: (value: number | undefined) => void;
  readonly placeholder?: string;
  readonly inputType?: 'number' | 'date' | undefined;
  readonly onChange?: (value: string | undefined) => void;
  readonly label?: string;
}

export const FilterInput: FC<FilterInputProps> = ({
  value,
  label,
  placeholder = '',
  inputType = undefined,
  onChange = noop,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div css={outerStyle}>
      {label}
      <MenuItem onFocus={() => inputRef.current?.focus()}>
        <div css={menuItemStyles}>
          <input
            css={inputStyles}
            value={value}
            onClick={(e) => {
              // Prevent propagation to the MenuItem which will try to select itself
              // as an option and close the dropdown
              e.stopPropagation();
            }}
            ref={inputRef}
            onMouseLeave={() => inputRef.current?.focus()}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' && e.key !== 'Escape') {
                // Prevent propagation to the MenuItem which can lead to focus/blur
                // state changes that will mess up the user writing experience.
                e.stopPropagation();
              }
            }}
            placeholder={placeholder}
            type={inputType}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </MenuItem>
    </div>
  );
};
