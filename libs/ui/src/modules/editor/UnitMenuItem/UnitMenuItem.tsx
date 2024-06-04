/* eslint-disable no-param-reassign */
import { Unit } from '@decipad/language-interfaces';
import { type Constant, getConstantByName } from '@decipad/remote-computer';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, useMemo, useReducer, useRef } from 'react';
import { MenuItem } from '../../../shared';
import { cssVar, p12Medium, p13Medium } from '../../../primitives';
import { menu } from '../../../styles';

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

const buttonStyles = css(p12Medium, {
  ':disabled': {
    color: cssVar('textDisabled'),
    cursor: 'not-allowed',
  },
  ':hover, :focus': {
    background: cssVar('backgroundHeavy'),
  },

  borderRadius: '6px',
  margin: '2px',
  padding: '4px 8px',
});

export type UnitsAction =
  | { type: 'text'; value: string }
  | { type: 'unit'; value: Unit[] | null }
  | { type: 'constant'; value: Constant };

interface UnitsState {
  text: string;
  unit: Unit[] | null;
  constant?: Constant;
}

const initialState: UnitsState = {
  text: '',
  unit: null,
};

function reducer(state: UnitsState, action: UnitsAction): UnitsState {
  switch (action.type) {
    case 'text':
      delete state.constant;
      return { ...state, text: action.value };
    case 'unit':
      delete state.constant;
      return { ...state, unit: action.value };
    case 'constant':
      return { ...state, constant: action.value };
  }
}

interface UnitMenuItemProps {
  readonly onSelect?: (unit: UnitsAction | undefined) => void;
  readonly parseUnit?: (
    value: string
  ) => Promise<Unit[] | null> | Unit[] | null;
  readonly placeholder?: string;
}

export const UnitMenuItem: FC<UnitMenuItemProps> = ({
  onSelect = noop,
  parseUnit = () => Promise.resolve(null),
  placeholder = 'Create a custom unit',
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const showCommitBtn = useMemo(() => {
    return state.text && (state.unit != null || state.constant != null);
  }, [state]);

  const handleKeyDown = async (newUnit: string) => {
    if (newUnit.length > 0) {
      const constant = getConstantByName(newUnit);

      if (constant) {
        dispatch({
          type: 'constant',
          value: constant,
        });
        return;
      }

      try {
        const unit = await parseUnit(newUnit);
        dispatch({ type: 'unit', value: unit });
      } catch (err) {
        console.error(err);
        dispatch({ type: 'unit', value: null });
      }
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const unitOrConstant: UnitsAction | undefined = state.constant
    ? { type: 'constant', value: state.constant }
    : state.unit
    ? { type: 'unit', value: state.unit }
    : undefined;

  return (
    <MenuItem
      onSelect={() => onSelect(unitOrConstant)}
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
            const newUnit = e.target.value;
            dispatch({ type: 'text', value: newUnit });
            handleKeyDown(newUnit);
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

        <button
          css={buttonStyles}
          onClick={() => onSelect(unitOrConstant)}
          disabled={!showCommitBtn}
        >
          Add
        </button>
      </div>
    </MenuItem>
  );
};
