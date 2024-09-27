import type { SimpleTableCellType, TableCellType } from '@decipad/editor-types';
import type { IntegrationStore } from '@decipad/react-contexts';
import type { FC } from 'react';
import { useCallback } from 'react';
import { css } from '@emotion/react';
import {
  CodeResult,
  ContentEditableInput,
  LiveCode,
  LoadingIndicator,
  Toggle,
  VariableTypeMenu,
  cssVar,
  getStringType,
  p12Medium,
  p16Regular,
} from '@decipad/ui';
import { Settings } from 'libs/ui/src/icons';
import { hideOnPrint } from 'libs/ui/src/styles/editor-layout';
import { deciOverflowStyles } from 'libs/ui/src/styles/scrollbars';
import { Computer } from '@decipad/computer-interfaces';

interface ResultPreviewProps {
  computer: Computer;
  blockId?: string;
  loading: boolean;
  name: string;
  setName: (n: string) => void;
  setTypeMapping: (index: number, type: SimpleTableCellType) => void;
  timeOfLastRun: IntegrationStore['timeOfLastRun'];

  columnsToHide: Array<string>;
  setColumnsToHide: (newColumnsToHide: Array<string>) => void;

  isFirstRowHeader: boolean;

  // if undefined, then we disable changing the input.
  setFirstRowHeader?: (value: boolean) => void;
}

export const ResultPreview: FC<ResultPreviewProps> = ({
  computer,
  blockId,
  loading,
  name,
  setName,
  setTypeMapping,
  timeOfLastRun,

  columnsToHide,
  setColumnsToHide,

  isFirstRowHeader,
  setFirstRowHeader,
}) => {
  const onChangeColumnType = useCallback(
    (index: number, type: TableCellType | undefined) => {
      if (!type) return;

      setTypeMapping(index, type as SimpleTableCellType);
    },
    [setTypeMapping]
  );

  // Changing the type when result is not a table
  const onChangeType = useCallback(
    (type: TableCellType | undefined) => {
      onChangeColumnType(0, type);
    },
    [onChangeColumnType]
  );

  const result = computer.getBlockIdResult$.use(blockId)?.result;

  const shouldDisplayPreview = result != null;
  const isVariableResult =
    result &&
    result.type.kind !== 'materialized-table' &&
    result.type.kind !== 'table';

  return (
    <div
      css={resultPreviewWrapperStyles(!!isVariableResult)}
      data-testId="result-preview"
    >
      {!isVariableResult && (
        <div css={useFirstRowAsHeaderStyles}>
          <label>Use first row as header</label>
          <Toggle
            variant="toggle"
            active={isFirstRowHeader}
            onChange={setFirstRowHeader}
          ></Toggle>
        </div>
      )}
      {loading ? <LoadingIndicator /> : null}
      {shouldDisplayPreview && (
        <LiveCode
          type={result.type.kind}
          meta={
            timeOfLastRun ? [{ label: 'Last run', value: timeOfLastRun }] : []
          }
        >
          <ContentEditableInput
            value={name}
            onChange={(newValue) => {
              setName(newValue);
            }}
          />
        </LiveCode>
      )}
      <div css={[isVariableResult && variableResultStyles, maxWidthParaStyles]}>
        {shouldDisplayPreview ? (
          <>
            <CodeResult
              type={result.type}
              value={result.value}
              meta={result.meta}
              variant="block"
              isResultPreview
              isLiveResult
              onChangeColumnType={onChangeColumnType}
              onHideColumn={(colName) => {
                const newColsToHide = [...columnsToHide];

                const existingIndex = newColsToHide.findIndex(
                  (v) => v === colName
                );

                if (existingIndex !== -1) {
                  newColsToHide.splice(existingIndex, 1);
                } else {
                  newColsToHide.push(colName);
                }

                setColumnsToHide(newColsToHide);
              }}
            />
            {isVariableResult && (
              <VariableTypeMenu
                trigger={
                  <button css={categoryAndCaretIntegrationStyles}>
                    <span
                      css={{
                        width: 14,
                        display: 'grid',
                      }}
                      data-testid="type-picker-button"
                    >
                      <Settings />
                    </span>
                    <span>Settings</span>
                  </button>
                }
                onChangeType={onChangeType}
                type={result.type || getStringType()}
              />
            )}
          </>
        ) : (
          'No results to preview'
        )}
      </div>
    </div>
  );
};

const buttonLook = {
  borderRadius: '6px',
  border: `1px solid ${cssVar('borderSubdued')}`,
  backgroundColor: cssVar('backgroundSubdued'),
  cursor: 'pointer',
  ':hover, :focus': {
    backgroundColor: cssVar('backgroundHeavy'),
  },
};

const categoryAndCaretIntegrationStyles = css(
  p12Medium,
  hideOnPrint,
  buttonLook,
  {
    display: 'inline-flex',
    gap: 4,
    padding: '2px 4px',
    alignItems: 'center',
  }
);

const variableResultStyles = css({
  display: 'flex',
  flexGrow: '1',
  gap: 8,
  alignItems: 'center',
  justifyContent: 'space-between',
});

const resultPreviewContainerStyles = css(
  {
    display: 'flex',
    gap: 8,
    border: `1px solid ${cssVar('backgroundDefault')}`,
    borderRadius: 12,
    padding: 16,
    div: {
      margin: 0,
    },
  },
  deciOverflowStyles
);

const resultPreviewWrapperStyles = (isVariableResult: boolean) =>
  css(
    resultPreviewContainerStyles,
    isVariableResult && {
      flexDirection: 'row',
      width: '100%',
    },
    !isVariableResult && {
      flexDirection: 'column',
      height: '100%',
    }
  );

const maxWidthParaStyles = css(deciOverflowStyles, {
  width: '100%',
  overflowX: 'auto',
  span: {
    maxWidth: 400,
    overflow: 'initial',
    whiteSpace: 'normal',
  },
});

const useFirstRowAsHeaderStyles = css(p16Regular, {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '32px',
});
