import { Result } from '@decipad/computer';
import { TableCellType } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { FC } from 'react';
import { ImportTableRowControls } from '../../molecules';
import { CodeResult } from '../../organisms';

interface LiveConnectionResultProps {
  result: Result.Result;
  isFirstRowHeaderRow?: boolean;
  setIsFirstRowHeader?: (is: boolean) => void;
  onChangeColumnType?: (columnIndex: number, type: TableCellType) => void;
}

export const LiveConnectionResult: FC<LiveConnectionResultProps> = ({
  result,
  isFirstRowHeaderRow,
  setIsFirstRowHeader = noop,
  onChangeColumnType = noop,
}) => {
  return (
    result && (
      <CodeResult
        type={result.type}
        value={result.value}
        variant="block"
        isLiveResult
        firstTableRowControls={
          <ImportTableRowControls
            isFirstRow={!isFirstRowHeaderRow}
            toggleFirstRowIsHeader={setIsFirstRowHeader}
          />
        }
        onChangeColumnType={onChangeColumnType}
      ></CodeResult>
    )
  );
};
