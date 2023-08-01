import { AST, parseSimpleValueUnit } from '@decipad/computer';
import { useComputer } from '@decipad/react-contexts';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, useRef, useState } from 'react';
import { MenuItem } from '../../atoms';
import { cssVar, p12Medium, p13Medium } from '../../primitives';
import { menu } from '../../styles';

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
  padding: '6px 12px',

  // Make input adjust alongside button
  width: 0, // Override vendor default width
  flex: '1 1 0px',
});

const buttonStyles = css(p12Medium, {
  ':hover, :focus': {
    background: cssVar('backgroundHeavy'),
  },

  borderRadius: '6px',
  margin: '2px',
  padding: '4px 8px',
});

interface ASTUnitMenuItemProps {
  readonly onSelect?: (unit: AST.Expression | '%' | undefined) => void;
  readonly parseUnit?: typeof parseSimpleValueUnit;
  readonly placeholder?: string;
}

export const ASTUnitMenuItem = ({
  onSelect = noop,
  parseUnit = parseSimpleValueUnit,
  placeholder = 'Create a custom unit',
}: ASTUnitMenuItemProps): ReturnType<FC> => {
  const [text, setText] = useState('');

  const names = useComputer().getSetOfNamesDefined$.use();
  const unit = parseUnit(text, names);

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <MenuItem
      onSelect={() => onSelect(unit)}
      onFocus={() => inputRef.current?.focus()}
    >
      <div css={menuItemStyles}>
        <input
          data-testid="advanced_unit_input"
          css={inputStyles}
          onClick={(e) => {
            // Prevent propagation to the MenuItem which will try to select itself
            // as an option and close the dropdown

            e.stopPropagation();
          }}
          ref={inputRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
          onMouseLeave={() => inputRef.current?.focus()}
          onKeyDown={(e) => {
            if (e.key !== 'Enter' && e.key !== 'Escape') {
              // Prevent propagation to the MenuItem which can lead to focus/blur
              // state changes that will mess up the user writing experience.
              e.stopPropagation();
            }
          }}
          placeholder={placeholder}
        />
        {unit != null && (
          <button
            data-testid="advanced_unit_button"
            css={buttonStyles}
            onClick={() => onSelect(unit)}
          >
            Add new
          </button>
        )}
      </div>
    </MenuItem>
  );
};
