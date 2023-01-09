import { Result } from '@decipad/computer';
import { AnyElement, TableCellType } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC } from 'react';
import { ImportTableRowControls } from '../../molecules';
import { CodeResult } from '../../organisms';
import { code } from '../../primitives';

interface LiveConnectionResultProps {
  result: Result.Result;
  isFirstRowHeaderRow?: boolean;
  setIsFirstRowHeader?: (is: boolean) => void;
  onChangeColumnType?: (columnIndex: number, type: TableCellType) => void;
  element: AnyElement;
}

export const LiveConnectionResult: FC<LiveConnectionResultProps> = ({
  result,
  isFirstRowHeaderRow,
  setIsFirstRowHeader = noop,
  onChangeColumnType = noop,
  element,
}) => {
  return (
    result && (
      <div css={css(code)}>
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
          element={element}
        ></CodeResult>
      </div>
    )
  );
};
