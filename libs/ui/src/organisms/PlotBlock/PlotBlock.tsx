/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import zip from 'lodash.zip';
import { ComponentProps, ReactNode, useEffect, useState, FC } from 'react';
import { noop } from '@decipad/utils';
import { CellInput, ErrorMessage, Label, Toast } from '../../atoms';
import { Plot as PlotIcon } from '../../icons';
import { cssVar, p12Medium } from '../../primitives';
import { PlotParams } from '../PlotParams/PlotParams';
import { PlotResult } from '../PlotResult/PlotResult';
import { initializeVega } from './initializeVega';

type StringSetter<T extends string | undefined = string> = (str: T) => void;

const plotIconSizeStyles = css({
  display: 'grid',
  width: '22px',
  height: '22px',
});

const plotTitleStyles = css({
  // TODO: title styles
  display: 'flex',
  alignItems: 'center',
  gap: 4,
});

const plotBlockStyles = css({
  display: 'grid',
  rowGap: '16px',
});

const plotStyles = css({
  alignSelf: 'center',
});

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

interface PlotBlockProps {
  readOnly?: boolean;
  errorMessage?: string;
  plotParams: ComponentProps<typeof PlotParams>;
  result?: ComponentProps<typeof PlotResult>;
  title: string;
  onTitleChange?: (newValue: string) => void;
}

export const PlotBlock = ({
  readOnly = false,
  errorMessage,
  plotParams,
  result,
  title,
  onTitleChange = noop,
}: PlotBlockProps): ReturnType<FC> => {
  initializeVega();
  return (
    <section
      data-test-id="chart-styles"
      css={plotBlockStyles}
      contentEditable={false}
    >
      <div css={plotTitleStyles}>
        <div css={plotIconSizeStyles}>
          <PlotIcon />
        </div>
        <CellInput
          value={title}
          onChange={onTitleChange}
          placeholder="Chart title"
        />
        {!readOnly && <PlotParams {...plotParams} />}
      </div>
      <>
        {errorMessage && <ErrorMessage error={errorMessage} />}
        {result && (
          <output css={plotStyles}>
            <PlotResult {...result} />
          </output>
        )}

        {!plotParams.sourceVarName && (
          <TableSearch
            varNames={plotParams.sourceVarNameOptions as readonly string[]}
            exprRefs={plotParams.sourceExprRefOptions as readonly string[]}
            setTable={plotParams.setSourceVarName}
          />
        )}
      </>
    </section>
  );
};

const TableSearch = ({
  varNames,
  exprRefs,
  setTable,
}: {
  varNames: readonly string[];
  exprRefs: readonly string[];
  setTable: (s: string) => void;
}) => {
  const [value, setValue] = useState('');
  const tables = zip(varNames, exprRefs);
  useEffect(() => {
    if (value !== '') {
      setTable(value);
    }
  }, [value, setTable]);

  if (exprRefs.length === 0) {
    return (
      <Toast appearance="warning">
        You can't create a chart because this document does not include any
        tables
      </Toast>
    );
  }

  return (
    <div>
      <SelectInput labelText="Select a table" value={value} setValue={setValue}>
        <option value="" key="none"></option>
        {tables.map(([varName, exprRef], i) => {
          if (varName === undefined || exprRef === undefined) return undefined;

          return (
            <option value={exprRef} key={i}>
              {varName}
            </option>
          );
        })}
      </SelectInput>
    </div>
  );
};
