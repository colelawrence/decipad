import { Result } from '@decipad/computer';
import type {
  LiveConnectionElement,
  LiveDataSetElement,
  LiveQueryElement,
  TableCellType,
} from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC } from 'react';
import { ImportTableRowControls } from '../../molecules';
import { CodeResult, DatabaseConnection } from '../../organisms';
import { code } from '../../primitives';
import { isDatabaseConnection } from '../../utils/isDatabaseConnection';

interface LiveConnectionResultProps {
  result: Result.Result;
  isFirstRowHeaderRow?: boolean;
  setIsFirstRowHeader?: (is: boolean) => void;
  onChangeColumnType?: (columnIndex: number, type: TableCellType) => void;
  element: LiveConnectionElement | LiveQueryElement | LiveDataSetElement;
  showLiveQueryResults?: boolean;
}

export const LiveConnectionResult: FC<LiveConnectionResultProps> = ({
  result,
  isFirstRowHeaderRow,
  setIsFirstRowHeader = noop,
  onChangeColumnType = noop,
  element,
  showLiveQueryResults = true,
}) => {
  return isDatabaseConnection(element) ? (
    <DatabaseConnection result={result} />
  ) : element.type !== 'live-dataset' && showLiveQueryResults ? (
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
  ) : null;
};
