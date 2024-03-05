/* eslint decipad/css-prop-named-variable: 0 */
import { justStopPropagation } from '@decipad/react-utils';
import { css } from '@emotion/react';
import { ChangeEvent, useCallback } from 'react';
import { cssVar, p12Medium } from '../../../primitives';
import { Label } from '../../../shared';
import { VoidBlock } from '../VoidBlock/VoidBlock';

const selectFontStyles = css(p12Medium);

const selectStyles = css({
  backgroundColor: cssVar('backgroundDefault'),
  maxWidth: 200,
  textOverflow: 'ellipsis',
  overflow: 'hidden',
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
  const onInternalChange = useCallback(
    (ev: ChangeEvent<HTMLSelectElement>) => onChange(ev.target.value as T),
    [onChange]
  );
  return (
    <VoidBlock>
      <Label
        renderContent={(id) => (
          <select
            css={[selectFontStyles, selectStyles]}
            id={id}
            onChange={onInternalChange}
            value={value}
            onClick={justStopPropagation}
          >
            {options.map((text, index) => (
              <option key={index} value={text} onClick={justStopPropagation}>
                {text}
              </option>
            ))}
          </select>
        )}
      >
        {label && <span css={selectFontStyles}>{label}:</span>}
      </Label>
    </VoidBlock>
  );
}
