import { ErrSpec, Result } from '@decipad/computer';
import { SimpleTableCellType, TableCellType } from '@decipad/editor-types';
import { formatError } from '@decipad/format';
import {
  IntegrationStore,
  useCodeConnectionStore,
} from '@decipad/react-contexts';
import {
  CodeResult,
  ContentEditableInput,
  ErrorMessage,
  LiveCode,
  TableColumnMenu,
  cssVar,
  getStringType,
  p12Medium,
} from '@decipad/ui';
import { css } from '@emotion/react';
import { Settings } from 'libs/ui/src/icons';
import { hideOnPrint } from 'libs/ui/src/styles/editor-layout';
import { deciOverflowStyles } from 'libs/ui/src/styles/scrollbars';
import { FC, useCallback, useEffect, useState } from 'react';

interface ResultPreviewProps {
  result?: Result.Result;
  name: string;
  setName: (n: string) => void;
  setTypeMapping: IntegrationStore['setResultTypeMapping'];
}

export const ResultPreview: FC<ResultPreviewProps> = ({
  result,
  name,
  setName,
  setTypeMapping,
}) => {
  const [foundError, setFoundError] = useState<ErrSpec | null>(null);
  const foundErrorOnce = useCallback(
    (newFound: ErrSpec) => {
      if (foundError) {
        return;
      }
      return setFoundError(newFound);
    },
    [foundError]
  );
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

  const { timeOfLastRun } = useCodeConnectionStore();

  const [open, setOpen] = useState(false);

  // happens when you return a list of different deci results
  // into a table
  //
  // e.g. Banana = 1
  //      Apple = "1"
  //      (now they are bound to `this` in the block)
  //      return {col1: this}
  if (result?.type.kind === 'materialized-table') {
    const { columnTypes } = result.type;
    columnTypes.forEach((ct) => {
      if (ct.kind === 'type-error') {
        foundErrorOnce(ct.errorCause);
      }
    });
  }

  const shouldDisplayPreview = !foundError && result;
  const isVariableResult = result && result.type.kind !== 'materialized-table';

  useEffect(() => {
    const type = result?.type;
    if (
      type &&
      type.kind !== 'column' &&
      type.kind !== 'materialized-column' &&
      type.kind !== 'table' &&
      type.kind !== 'materialized-table' &&
      type.kind !== 'row' &&
      type.kind !== 'range' &&
      type.kind !== 'pending' &&
      type.kind !== 'nothing' &&
      type.kind !== 'function' &&
      type.kind !== 'type-error'
    ) {
      onChangeType(type);
    }
  }, [onChangeType, result]);

  return (
    <div css={resultPreviewWrapperStyles(!!isVariableResult)}>
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
              variant="block"
              isLiveResult
              onChangeColumnType={onChangeColumnType}
            />
            {isVariableResult && (
              <TableColumnMenu
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
                open={open}
                onChangeOpen={setOpen}
                onChangeColumnType={onChangeType}
                isForImportedColumn={true}
                type={result.type || getStringType()}
              />
            )}
          </>
        ) : foundError != null ? (
          <ErrorMessage
            error={`We found an error while executing: ${formatError(
              'en-US',
              foundError
            )}`}
          />
        ) : (
          'No results to preview. Did you forget to run?'
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

const maxWidthParaStyles = css({
  span: {
    maxWidth: 400,
    overflow: 'initial',
    whiteSpace: 'normal',
  },
});
