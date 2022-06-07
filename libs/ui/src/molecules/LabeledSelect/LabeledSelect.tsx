import { css } from '@emotion/react';
import { Label } from '../../atoms';
import { cssVar, p12Medium } from '../../primitives';

const selectFontStyles = css(p12Medium);

const selectStyles = css({
  backgroundColor: cssVar('highlightColor'),
});

interface LabeledSelectProps<T extends string> {
  label?: string;
  options: T[];
  value?: T;
  onChange: (newSelected: T) => void;
}

export function LabeledSelect<T extends string>({
  label,
  options,
  value,
  onChange,
}: LabeledSelectProps<T>) {
  return (
    <Label
      renderContent={(id) => (
        <select
          css={[selectFontStyles, selectStyles]}
          id={id}
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
      )}
    >
      {label && <span css={selectFontStyles}>{label}:</span>}
    </Label>
  );
}
