/* eslint decipad/css-prop-named-variable: 0 */
import { AutocompleteName } from '@decipad/computer';
import { css } from '@emotion/react';
import { FC, ReactNode, useState } from 'react';
import { Label } from '../../atoms';
import { cssVar, p12Medium } from '../../primitives';
import { hideOnPrint } from '../../styles/editor-layout';

const selectFontStyles = css(p12Medium);

const hoveredStyles = css({
  backgroundColor: cssVar('strongHighlightColor'),
});

const selectStyles = css({
  backgroundColor: cssVar('highlightColor'),
  fontWeight: 'bold',
  ':hover': { ...hoveredStyles },
});

const unselectedValueStyles = css({
  color: cssVar('evenStrongerHighlightColor'),
});

interface SelectInputProps {
  readonly labelText: string;
  readonly children: ReactNode;
  readonly value?: string;
  readonly setValue: (value: string) => void;
}

const SelectInput = ({
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
          css={[
            selectFontStyles,
            selectStyles,
            !value && unselectedValueStyles,
            hovered && hoveredStyles,
          ]}
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
      <span css={selectFontStyles}>{labelText}:</span>
    </Label>
  );
};

interface VariableNameProps {
  label?: string;
  variableNames: AutocompleteName[];
  selectedVariableName?: string;
  onChangeVariableName: (varName: string) => void;
}

export const VariableNameSelector: FC<VariableNameProps> = ({
  label = 'Variable name',
  variableNames,
  selectedVariableName,
  onChangeVariableName,
}) => {
  return (
    <div css={hideOnPrint} contentEditable={false}>
      <SelectInput
        labelText={label}
        value={selectedVariableName}
        setValue={onChangeVariableName}
      >
        <option key="empty" value={''}>
          Choose...
        </option>
        {variableNames.map((varName) => (
          <option key={varName.blockId} value={varName.blockId}>
            {varName.name}
          </option>
        ))}
      </SelectInput>
    </div>
  );
};
