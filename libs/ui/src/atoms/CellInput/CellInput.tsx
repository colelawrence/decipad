import { css } from '@emotion/react';
import { useRef, useEffect, FC, useState } from 'react';
import { identity, noop } from '@decipad/utils';
import { p13Medium, p14Medium } from '../../primitives';
import { blockAlignment } from '../../styles';

const inputStyles = css({
  width: '100%',
  background: 'transparent',
  border: 0,

  '::placeholder': {
    opacity: 0.5,
  },
});

const headingStyles = css(blockAlignment.editorTable.typography, {
  // Height needs to be explicitly set to the line height because <input>s are weird
  height: `calc(${blockAlignment.editorTable.typography?.lineHeight} * ${blockAlignment.editorTable.typography?.fontSize})`,
});

const headerStyles = css(p13Medium, {
  padding: '6px 0',
});

const dataStyles = css(p14Medium, {
  padding: '8px 0',
});

const alwaysTrue = () => true;

type Variant = 'heading' | 'header' | 'data';

export interface CellInputProps {
  readonly placeholder?: string;
  readonly readOnly?: boolean;
  readonly variant?: Variant;
  readonly value: string;
  readonly format?: (value: string) => string;
  readonly onChange?: (newValue: string) => void;
  readonly validate?: (value: string) => boolean;
  readonly transform?: (newValue: string) => string;
}

/** Sort of coupled to tables. Once blurred, commits changes by calling onChange */
export const CellInput = ({
  placeholder,
  readOnly = false,
  variant = 'data',
  value,
  format = identity,
  onChange = noop,
  validate = alwaysTrue,
  transform = identity,
}: CellInputProps): ReturnType<FC> => {
  const [state, setState] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset our state whenever `props.value` change.
  useEffect(() => {
    setState(null);
  }, [value]);

  const submit = () => {
    if (state == null) {
      return;
    }

    if (validate(state)) {
      onChange(transform(state));
    } else {
      onChange('');
    }

    setState(null);
  };

  const displayValue = state != null ? state : format(value);

  return (
    <input
      css={[
        inputStyles,
        variant === 'heading' && headingStyles,
        variant === 'header' && headerStyles,
        variant === 'data' && dataStyles,
      ]}
      ref={inputRef}
      onBlur={submit}
      onChange={(e) => {
        setState(e.target.value);
      }}
      onFocus={() => {
        setState(value);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          submit();
        }
      }}
      placeholder={placeholder}
      readOnly={readOnly}
      value={displayValue}
    />
  );
};
