import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { useRef, useEffect, FC } from 'react';

const inputStyles = css({
  height: 42,
  width: '100%',
  padding: 12,
  background: 'transparent',
  border: 0,
  ':focus': {
    border: 0,
  },
});

interface EditableCellContentsProps {
  value: string;
  onChange?: (newValue: string) => void;
  validate?: (value: string) => boolean;
}

/** Sort of coupled to tables. Once blurred, commits changes by calling onChange */
export const EditableCellContents: FC<EditableCellContentsProps> = ({
  value,
  onChange = noop,
  validate = () => true,
}) => {
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
      css={inputStyles}
      ref={inputRef}
      defaultValue={value}
      onBlur={submit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          submit();
        }
      }}
    ></input>
  );
};
