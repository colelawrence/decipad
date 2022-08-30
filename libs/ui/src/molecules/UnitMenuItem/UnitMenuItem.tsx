import { FC, useEffect, useReducer, useRef } from 'react';
import { css } from '@emotion/react';
import { noop } from '@decipad/utils';
import type { Unit } from '@decipad/computer';
import { cssVar, p12Medium, p13Medium, setCssVar } from '../../primitives';
import { MenuItem } from '../../atoms';
import { menu } from '../../styles';

const menuItemStyles = css({
  background: cssVar('backgroundColor'),
  border: `1px solid ${cssVar('strongHighlightColor')}`,
  borderRadius: '6px',
  ':hover, :focus-within': {
    borderColor: `${cssVar('strongerHighlightColor')}`,
  },

  display: 'flex',

  margin: `calc(-1 * ${menu.itemPadding})`,
});

const inputStyles = css(p13Medium, {
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
  ':focus-within': {
    ...setCssVar('currentTextColor', cssVar('normalTextColor')),
  },
  background: cssVar('highlightColor'),
  borderRadius: '6px',
  padding: '6px 12px',

  // Make input adjust alongside button
  width: 0, // Override vendor default width
  flex: '1 1 0px',
});

const buttonStyles = css(p12Medium, {
  ':hover, :focus': {
    background: cssVar('strongHighlightColor'),
  },

  borderRadius: '6px',
  margin: '2px',
  padding: '4px 8px',
});

type UnitsAction =
  | { type: 'text'; value: string }
  | { type: 'unit'; value: Unit[] | null };

interface UnitsState {
  text: string;
  unit: Unit[] | null;
}

const initialState: UnitsState = {
  text: '',
  unit: null,
};

function reducer(state: UnitsState, action: UnitsAction): UnitsState {
  switch (action.type) {
    case 'text':
      return { ...state, text: action.value };
    case 'unit':
      return { ...state, unit: action.value };
  }
}

interface UnitMenuItemProps {
  readonly onSelect?: (unit: Unit[] | null) => void;
  readonly parseUnit?: (value: string) => Promise<Unit[] | null>;
  readonly placeholder?: string;
}

export const UnitMenuItem = ({
  onSelect = noop,
  parseUnit = () => Promise.resolve(null),
  placeholder = 'Create a custom unit',
}: UnitMenuItemProps): ReturnType<FC> => {
  const [state, dispatch] = useReducer(reducer, initialState);
  useEffect(() => {
    if (state.text.length > 0) {
      (async () => {
        try {
          const unit = await parseUnit(state.text);
          dispatch({ type: 'unit', value: unit });
        } catch {
          dispatch({ type: 'unit', value: null });
        }
      })();
    }
  }, [state.text, parseUnit]);

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <MenuItem
      onSelect={() => onSelect(state.unit)}
      onFocus={() => inputRef.current?.focus()}
    >
      <div css={menuItemStyles}>
        <input
          css={inputStyles}
          defaultValue=""
          onClick={(e) => {
            // Prevent propagation to the MenuItem which will try to select itself
            // as an option and close the dropdown

            e.stopPropagation();
          }}
          ref={inputRef}
          onChange={(e) => {
            dispatch({ type: 'text', value: e.target.value });
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
        {state.unit != null && (
          <button css={buttonStyles} onClick={() => onSelect(state.unit)}>
            Add new
          </button>
        )}
      </div>
    </MenuItem>
  );
};
