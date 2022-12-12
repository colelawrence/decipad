import { AutocompleteName } from '@decipad/computer';
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { Label } from '../../atoms';
import { cssVar, p12Medium } from '../../primitives';

const selectFontStyles = css(p12Medium);

const selectStyles = css({
  backgroundColor: cssVar('highlightColor'),
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
    <div contentEditable={false}>
      <SelectInput
        labelText={label}
        value={selectedVariableName}
        setValue={onChangeVariableName}
      >
        <option key="empty" value={undefined}>
          -
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
