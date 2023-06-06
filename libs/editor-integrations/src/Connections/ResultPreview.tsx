import { Result } from '@decipad/computer';
import { SimpleTableCellType, TableCellType } from '@decipad/editor-types';
import { IntegrationStore, useComputer } from '@decipad/react-contexts';
import {
  CodeResult,
  ContentEditableInput,
  LiveCode,
  TableColumnMenu,
  cssVar,
  getStringType,
} from '@decipad/ui';
import { FC, useCallback, useMemo, useState } from 'react';

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

  // Chacnging the type when result is not a table
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

  const [open, setOpen] = useState(false);

  return (
    <div
      css={[
        {
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          border: `1px solid ${cssVar('highlightColor')}`,
          borderRadius: 12,
          padding: 16,
          height: '100%',
          div: {
            margin: 0,
          },
          ' div > span': {
            maxWidth: 'unset',
            overflow: 'initial',
            whiteSpace: 'normal',
          },
        },
      ]}
    >
      {result && (
        <LiveCode>
          <ContentEditableInput
            value={name}
            onChange={(newValue) => {
              setName(newValue);
            }}
          />
        </LiveCode>
      )}
      <div>
        {result ? (
          <>
            <CodeResult
              type={result.type}
              value={result.value}
              variant="block"
              isLiveResult
              onChangeColumnType={onChangeColumnType}
            />
            {result.type.kind !== 'materialized-table' && (
              <TableColumnMenu
                trigger={<button>Change Type</button>}
                open={open}
                onChangeOpen={setOpen}
                onChangeColumnType={onChangeType}
                isForImportedColumn={true}
                type={getStringType()}
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
