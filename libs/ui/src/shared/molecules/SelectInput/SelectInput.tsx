/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode, useState } from 'react';
import { cssVar, p12Medium } from '../../../primitives';
import { Label } from '../../atoms/Label/Label';

const selectFontStyles = css(p12Medium, {
  color: cssVar('textDefault'),
});

const hoveredStyles = css({
  backgroundColor: cssVar('backgroundHeavy'),
});

const selectStyles = css({
  backgroundColor: cssVar('backgroundSubdued'),
  fontWeight: 'bold',
  ':hover': { ...hoveredStyles },
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
  const [hovered, setHovered] = useState(false);
  return (
    <Label
      onHover={setHovered}
      renderContent={(id) => (
        <select
          css={[selectFontStyles, selectStyles, hovered && hoveredStyles]}
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
