import { css } from '@emotion/react';
import { cssVar, p12Medium } from '../../primitives';

const selectFontStyles = css(p12Medium);

const selectStyles = css({
  backgroundColor: cssVar('highlightColor'),
});

interface SelectProps<T extends string> {
  options: T[];
  value?: T;
  onChange: (newSelected: T) => void;
}

export function Select<T extends string>({
  options,
  value,
  onChange,
}: SelectProps<T>) {
  return (
    <select
      css={[selectFontStyles, selectStyles]}
      onChange={(ev) => {
        onChange(ev.target.value as T);
      }}
      value={value}
    >
      {options.map((text, index) => (
        <option key={index} value={text}>
          {text}
        </option>
      ))}
    </select>
  );
}
