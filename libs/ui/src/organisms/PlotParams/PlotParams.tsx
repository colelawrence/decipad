import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { Label } from '../../atoms';
import { cssVar, p12Medium } from '../../primitives';

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
  readonly colorScheme?: string;
  readonly setColorScheme: StringSetter;
}

interface SelectInputProps {
  readonly labelText: string;
  readonly children: ReactNode;
  readonly value: string;
  readonly setValue: StringSetter;
}

const selectFontStyles = css(p12Medium);

const selectStyles = css({
  backgroundColor: cssVar('highlightColor'),
});

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

const containerStyles = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '4px',

  paddingLeft: '30px',
  marginBottom: '20px',
  borderLeft: `4px solid ${cssVar('highlightColor')}`,
});

const colorSchemes = [
  'accent',
  'category20',
  'dark2',
  'paired',
  'pastel1',
  'pastel2',
  'set2',
  'set3',
];

const ColorSchemeOptions = () => {
  return (
    <>
      <option key="__none" value=""></option>;
      {colorSchemes.map((scheme) => (
        <option key={scheme} value={scheme}>
          {scheme}
        </option>
      ))}
    </>
  );
};

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
  colorScheme,
  setColorScheme,
}: PlotParamsProps): ReturnType<FC> => {
  const emptyColumnOption = <option key="__none" value=""></option>;
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
      <SelectInput
        labelText="Table"
        setValue={setSourceVarName}
        value={sourceVarName}
      >
        {sourceVarNameOptionsOptions}
      </SelectInput>
      <SelectInput labelText="Chart" setValue={setMarkType} value={markType}>
        {markTypeOptions}
      </SelectInput>
      {markType !== 'arc' && (
        <>
          <SelectInput
            labelText="x"
            setValue={setXColumnName}
            value={xColumnName}
          >
            {columnOptions}
          </SelectInput>
          <SelectInput
            labelText="y"
            setValue={setYColumnName}
            value={yColumnName}
          >
            {columnOptions}
          </SelectInput>
          {markType !== 'line' && markType !== 'area' && (
            <SelectInput
              labelText="Sizes"
              setValue={setSizeColumnName}
              value={sizeColumnName}
            >
              {columnOptions}
            </SelectInput>
          )}
        </>
      )}

      {markType === 'arc' && (
        <SelectInput
          labelText="Slice size"
          setValue={setThetaColumnName}
          value={thetaColumnName}
        >
          {columnOptions}
        </SelectInput>
      )}

      {(markType === 'bar' || markType === 'arc') && (
        <>
          <SelectInput
            labelText="Colors"
            setValue={setColorColumnName}
            value={colorColumnName}
          >
            {columnOptions}
          </SelectInput>
          <SelectInput
            labelText="Color Scheme"
            setValue={setColorScheme}
            value={colorScheme || ''}
          >
            <ColorSchemeOptions />
          </SelectInput>
        </>
      )}
    </div>
  );
};
