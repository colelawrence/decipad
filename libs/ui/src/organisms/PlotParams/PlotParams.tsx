import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { Label } from '../../atoms';
import { cssVar, p12Medium } from '../../primitives';
import { hideOnPrint } from '../../styles/editor-layout';

type StringSetter<T extends string | undefined = string> = (str: T) => void;

const markTypes = ['line', 'bar', 'arc', 'area', 'point'] as const;

type MarkType = typeof markTypes[number];

const markTypeNames: Record<MarkType, string> = {
  bar: 'Bar',
  line: 'Line',
  point: 'Point',
  area: 'Area',
  arc: 'Pie',
};

const shapes = ['point', 'circle', 'square', 'tick'];

export interface PlotParamsProps {
  readonly sourceVarName: string;
  readonly sourceVarNameOptions: ReadonlyArray<string>;
  readonly sourceExprRefOptions?: ReadonlyArray<string>;
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
  readonly shape: string;
  readonly setShape: StringSetter;
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
  width: '100%',
  maxWidth: '140px',
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

const wrapperContainerStyles = css({
  marginBottom: '20px',
});

const containerStyles = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '4px',
  marginBottom: '4px',
});

const colorSchemes = [
  'deciblues',
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
  sourceExprRefOptions,
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
  shape,
  setShape,
}: PlotParamsProps): ReturnType<FC> => {
  const emptyColumnOption = <option key="__none" value=""></option>;
  const sourceVarNameOptionsOptions = [emptyColumnOption].concat(
    sourceVarNameOptions.map((sourceVarNameOption, index) => (
      <option
        key={sourceVarNameOption}
        value={sourceExprRefOptions?.[index] ?? sourceVarNameOption}
      >
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
        {markTypeNames[mark]}
      </option>
    ))
  );

  return (
    <div css={[wrapperContainerStyles, hideOnPrint]}>
      <div css={containerStyles}>
        <SelectInput
          labelText="Table"
          setValue={setSourceVarName}
          value={sourceVarName}
        >
          {sourceVarNameOptionsOptions}
        </SelectInput>
        {sourceVarName && (
          <>
            <SelectInput
              labelText="Chart"
              setValue={setMarkType}
              value={shapes.includes(markType) ? 'point' : markType}
            >
              {markTypeOptions}
            </SelectInput>
            {shapes.includes(markType) && (
              <SelectInput labelText="Shape" setValue={setShape} value={shape}>
                {shapes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </SelectInput>
            )}
          </>
        )}
      </div>

      {sourceVarName && (
        <div css={containerStyles}>
          {markType !== 'arc' && (
            <>
              <SelectInput
                labelText="Label"
                setValue={setXColumnName}
                value={xColumnName}
              >
                {columnOptions}
              </SelectInput>
              <SelectInput
                labelText="Value"
                setValue={setYColumnName}
                value={yColumnName}
              >
                {columnOptions}
              </SelectInput>
              {(shapes.includes(markType) || markType === 'area') && (
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
            <SelectInput
              labelText="Colors"
              setValue={setColorColumnName}
              value={colorColumnName}
            >
              {columnOptions}
            </SelectInput>
          )}
          {(markType === 'bar' || markType === 'arc') && colorColumnName && (
            <SelectInput
              labelText="Color Scheme"
              setValue={setColorScheme}
              value={colorScheme || ''}
            >
              <ColorSchemeOptions />
            </SelectInput>
          )}
        </div>
      )}
    </div>
  );
};
