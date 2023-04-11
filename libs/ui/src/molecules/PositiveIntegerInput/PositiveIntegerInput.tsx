import {
  ChangeEvent,
  FC,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { css } from '@emotion/react';
import { cssVar, p12Regular } from '../../primitives';

const inputStyles = css(p12Regular, {
  width: '50px',
  backgroundColor: cssVar('backgroundColor'),
  border: 0,
  fontVariantNumeric: 'tabular-nums',
  textAlign: 'center',

  '::placeholder': {
    opacity: 0.5,
  },
  padding: '8px 0',
  lineHeight: '25px',
  height: '25px',
});

interface PositiveIntegerInputProps {
  value: number;
  onChange: (newValue: number) => void;
  min: number;
  max: number;
}

export const PositiveIntegerInput: FC<PositiveIntegerInputProps> = ({
  value,
  onChange,
  min,
  max,
}) => {
  const cleanValue = useCallback(
    (stringValue: string): number => {
      const n = Number(stringValue);
      if (isNaN(n)) {
        return value;
      }
      return Math.max(Math.min(Math.floor(n), max), min);
    },
    [max, min, value]
  );

  const [internalValue, setInternalValue] = useState(value.toString());
  const lastCommittedValue = useRef(value);

  useEffect(() => {
    if (lastCommittedValue.current !== value) {
      lastCommittedValue.current = value;
      setInternalValue(value.toString());
    }
  }, [value]);

  return (
    <input
      css={inputStyles}
      type="text"
      value={internalValue}
      onChange={useCallback((ev: ChangeEvent<HTMLInputElement>) => {
        setInternalValue(ev.target.value.trim());
      }, [])}
      onKeyDown={useCallback(
        (ev: KeyboardEvent<HTMLInputElement>) => {
          if (ev.code === 'Enter') {
            const inputValue = internalValue;
            if (inputValue) {
              const newValue = cleanValue(inputValue);
              onChange(newValue);
            }
            ev.stopPropagation();
          }
        },
        [cleanValue, internalValue, onChange]
      )}
    />
  );
};
