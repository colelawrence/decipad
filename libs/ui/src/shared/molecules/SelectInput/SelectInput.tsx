/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar, p12Medium } from '../../../primitives';
import { Label } from '../../atoms/Label/Label';

const selectFontStyles = css(p12Medium, {
  color: cssVar('textDefault'),
});

const selectStyles = css({
  backgroundColor: 'transparent',
  fontWeight: 'bold',
  maxWidth: 200,
  textOverflow: 'ellipsis',
  overflow: 'hidden',
});

interface SelectInputProps {
  readonly labelText: string;
  readonly children: ReactNode;
  readonly value?: string;
  readonly setValue: (value: string) => void;
}

export const SelectInput = ({
  labelText,
  children,
  value,
  setValue,
}: SelectInputProps): ReturnType<FC> => {
  return (
    <Label
      renderContent={(id) => (
        <select
          css={[selectFontStyles, selectStyles]}
          id={id}
          onChange={(ev) => {
            setValue(ev.target.value);
          }}
          value={value}
        >
          {children}
        </select>
      )}
    >
      <span css={selectFontStyles}>{labelText}</span>
    </Label>
  );
};
