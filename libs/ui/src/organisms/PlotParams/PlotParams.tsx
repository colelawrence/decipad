import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { Label } from '../../atoms';
import { p12Medium } from '../../primitives';

type StringSetter = (str: string) => void;

const markTypes = [
  'bar',
  'circle',
  'square',
  'tick',
  'line',
  'area',
  'point',
  'arc',
] as const;
type MarkType = typeof markTypes[number];

interface PlotParamsProps {
  readonly sourceVarName: string;
  readonly sourceVarNameOptions: ReadonlyArray<string>;
  readonly setSourceVarName: StringSetter;
  readonly markType: MarkType;
  readonly setMarkType: StringSetter;
  readonly columnNameOptions: ReadonlyArray<string>;
  readonly xColumnName: string;
  readonly setXColumnName: StringSetter;
  readonly yColumnName: string;
  readonly setYColumnName: StringSetter;
  readonly sizeColumnName: string;
  readonly setSizeColumnName: StringSetter;
  readonly colorColumnName: string;
  readonly setColorColumnName: StringSetter;
  readonly thetaColumnName: string;
  readonly setThetaColumnName: StringSetter;
}

interface SelectInputProps {
  readonly labelText: string;
  readonly children: ReactNode;

  readonly value: string;
  readonly setValue: StringSetter;
}

const selectStyles = css(p12Medium);

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
          css={selectStyles}
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
      <span css={selectStyles}>{labelText}:</span>
    </Label>
  );
};

const containerStyles = css({
  display: 'grid',
  rowGap: '16px',
});

const groupStyles = css({
  display: 'grid',
  rowGap: '8px',
});

export const PlotParams = ({
  sourceVarName,
  sourceVarNameOptions,
  columnNameOptions,
  setSourceVarName,
  markType,
  setMarkType,
  xColumnName,
  setXColumnName,
  yColumnName,
  setYColumnName,
  sizeColumnName,
  setSizeColumnName,
  colorColumnName,
  setColorColumnName,
  thetaColumnName,
  setThetaColumnName,
}: PlotParamsProps): ReturnType<FC> => {
  const emptyColumnOption = (
    <option key="__none" value="">
      -
    </option>
  );
  const sourceVarNameOptionsOptions = [emptyColumnOption].concat(
    sourceVarNameOptions.map((sourceVarNameOption) => (
      <option key={sourceVarNameOption} value={sourceVarNameOption}>
        {sourceVarNameOption}
      </option>
    ))
  );
  const columnOptions = [emptyColumnOption].concat(
    columnNameOptions.map((columnNameOption) => (
      <option key={columnNameOption} value={columnNameOption}>
        {columnNameOption}
      </option>
    ))
  );

  const markTypeOptions = [emptyColumnOption].concat(
    markTypes.map((mark) => (
      <option key={mark} value={mark}>
        {mark}
      </option>
    ))
  );

  return (
    <div css={containerStyles}>
      <div css={groupStyles}>
        <SelectInput
          labelText="Source var name"
          setValue={setSourceVarName}
          value={sourceVarName}
        >
          {sourceVarNameOptionsOptions}
        </SelectInput>
        <SelectInput
          labelText="Mark type"
          setValue={setMarkType}
          value={markType}
        >
          {markTypeOptions}
        </SelectInput>
      </div>
      <div css={groupStyles}>
        <SelectInput
          labelText="Horizontal values"
          setValue={setXColumnName}
          value={xColumnName}
        >
          {columnOptions}
        </SelectInput>
        <SelectInput
          labelText="Vertical values"
          setValue={setYColumnName}
          value={yColumnName}
        >
          {columnOptions}
        </SelectInput>
        <SelectInput
          labelText="Size values"
          setValue={setSizeColumnName}
          value={sizeColumnName}
        >
          {columnOptions}
        </SelectInput>
        <SelectInput
          labelText="Color values"
          setValue={setColorColumnName}
          value={colorColumnName}
        >
          {columnOptions}
        </SelectInput>
        <SelectInput
          labelText="Theta values"
          setValue={setThetaColumnName}
          value={thetaColumnName}
        >
          {columnOptions}
        </SelectInput>
      </div>
    </div>
  );
};
