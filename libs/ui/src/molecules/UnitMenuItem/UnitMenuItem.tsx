import { FC, useEffect, useReducer } from 'react';
import { css } from '@emotion/react';
import { noop } from '@decipad/utils';
import { SerializedUnits } from '@decipad/language';
import {
  cssVar,
  grey200,
  grey300,
  p12Medium,
  p13Medium,
  setCssVar,
  white,
} from '../../primitives';
import { MenuItem } from '../../atoms';
import { menu } from '../../styles';

const menuItemStyles = css({
  background: white.rgb,
  border: `1px solid ${grey200.rgb}`,
  borderRadius: '6px',
  ':hover, :focus-within': {
    borderColor: `${grey300.rgb}`,
  },

  display: 'flex',

  margin: `calc(-1 * ${menu.itemPadding})`,
});

const inputStyles = css(p13Medium, {
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
  ':focus-within': {
    ...setCssVar('currentTextColor', cssVar('normalTextColor')),
  },

  borderRadius: '6px',
  padding: '6px 12px',

  // Make input adjust alongside button
  width: 0, // Override vendor default width
  flex: '1 1 0px',
});

const buttonStyles = css(p12Medium, {
  background: cssVar('highlightColor'),
  ':hover, :focus': {
    background: cssVar('strongHighlightColor'),
  },

  borderRadius: '6px',
  margin: '2px',
  padding: '4px 8px',
});

type Unit = SerializedUnits | null;

type UnitsAction =
  | { type: 'text'; value: string }
  | { type: 'unit'; value: Unit };

interface UnitsState {
  text: string;
  unit: Unit;
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
  readonly onSelect?: (unit: Unit) => void;
  readonly parseUnit?: (value: string) => Promise<Unit>;
}

export const UnitMenuItem = ({
  onSelect = noop,
  parseUnit = () => Promise.resolve(null),
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
  return (
    <MenuItem onSelect={() => onSelect(state.unit)}>
      <div css={menuItemStyles}>
        <input
          css={inputStyles}
          defaultValue=""
          onClick={(e) => {
            // Prevent propagation to the MenuItem which will try to select itself
            // as an option and close the dropdown
            e.stopPropagation();
          }}
          onChange={(e) => {
            dispatch({ type: 'text', value: e.target.value });
          }}
          onKeyDown={(e) => {
            if (e.key !== 'Enter' && e.key !== 'Escape') {
              // Prevent propagation to the MenuItem which can lead to focus/blur
              // state changes that will mess up the user writing experience.
              e.stopPropagation();
            }
          }}
          placeholder="Create a custom unit"
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
