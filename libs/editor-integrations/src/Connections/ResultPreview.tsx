import { Result } from '@decipad/computer';
import { SimpleTableCellType, TableCellType } from '@decipad/editor-types';
import {
  IntegrationStore,
  useCodeConnectionStore,
  useComputer,
} from '@decipad/react-contexts';
import {
  CodeResult,
  ContentEditableInput,
  LiveCode,
  TableColumnMenu,
  cssVar,
  getStringType,
  p12Medium,
} from '@decipad/ui';
import { css } from '@emotion/react';
import { Settings } from 'libs/ui/src/icons';
import { hideOnPrint } from 'libs/ui/src/styles/editor-layout';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

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

  const computer = useComputer();
  const parseUnit = useMemo(
    () => computer.getUnitFromText.bind(computer),
    [computer]
  );

  const { timeOfLastRun } = useCodeConnectionStore();

  const [open, setOpen] = useState(false);

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
    <div
      css={css(
        {
          display: 'flex',
          gap: 8,
          border: `1px solid ${cssVar('highlightColor')}`,
          borderRadius: 12,
          padding: 16,
          div: {
            margin: 0,
          },
          ' div > span': {
            maxWidth: 'unset',
            overflow: 'initial',
            whiteSpace: 'normal',
          },
        },
        isVariableResult && {
          flexDirection: 'row',
          width: '100%',
        },
        !isVariableResult && {
          flexDirection: 'column',
          height: '100%',
        }
      )}
    >
      {result && (
        <LiveCode type={result.type.kind} timeOfLastRun={timeOfLastRun}>
          <ContentEditableInput
            value={name}
            onChange={(newValue) => {
              setName(newValue);
            }}
          />
        </LiveCode>
      )}
      <div css={css(isVariableResult && variableResultStyles)}>
        {result ? (
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
                  <div css={categoryAndCaretIntegrationStyles}>
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
                  </div>
                }
                open={open}
                onChangeOpen={setOpen}
                onChangeColumnType={onChangeType}
                isForImportedColumn={true}
                type={result.type || getStringType()}
                parseUnit={parseUnit}
              />
            )}
          </>
        ) : (
          'No results to preview. Did you forget to run?'
        )}
      </div>
    </div>
  );
};

const buttonLook = {
  borderRadius: '6px',
  border: `1px solid ${cssVar('borderColor')}`,
  backgroundColor: cssVar('tintedBackgroundColor'),
  cursor: 'pointer',
  ':hover, :focus': {
    backgroundColor: cssVar('strongHighlightColor'),
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
