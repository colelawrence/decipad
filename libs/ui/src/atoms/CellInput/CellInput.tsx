import { css } from '@emotion/react';
import { KeyboardEvent, useRef, useEffect, FC } from 'react';
import { h2, p13Medium, p14Medium } from '../../primitives';
import { noop } from '../../utils';

const inputStyles = css({
  width: '100%',
  background: 'transparent',
  border: 0,

  '::placeholder': {
    opacity: 0.5,
  },
});

const headingStyles = css(h2);

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
  readonly variant?: Variant;
  readonly value: string;
  readonly onChange?: (newValue: string) => void;
  readonly onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  readonly validate?: (value: string) => boolean;
}

/** Sort of coupled to tables. Once blurred, commits changes by calling onChange */
export const CellInput = ({
  placeholder,
  variant = 'data',
  value,
  onChange = noop,
  onKeyDown = noop,
  validate = alwaysTrue,
}: CellInputProps): ReturnType<FC> => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = value;
    }
  }, [value]);

  const submit = () => {
    const newValue = inputRef.current?.value;

    if (newValue == null) return;

    if (validate(newValue)) {
      onChange(newValue);
    } else if (inputRef.current) {
      inputRef.current.value = '';
      onChange('');
    }
  };

  return (
    <input
      css={[
        inputStyles,
        variant === 'heading' && headingStyles,
        variant === 'header' && headerStyles,
        variant === 'data' && dataStyles,
      ]}
      ref={inputRef}
      defaultValue={value}
      onBlur={submit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          submit();
        } else {
          onKeyDown(e);
        }
      }}
      placeholder={placeholder}
    />
  );
};
