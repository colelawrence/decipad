/* eslint decipad/css-prop-named-variable: 0 */
import type { Result } from '@decipad/language-interfaces';
import type {
  LiveConnectionElement,
  LiveDataSetElement,
  LiveQueryElement,
  TableCellType,
} from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC } from 'react';
import { ImportTableFirstRowControls } from '../../../shared';
import { CodeResult } from '../CodeResult/CodeResult';
import { code } from '../../../primitives';
import { isDatabaseConnection } from '../../../utils/isDatabaseConnection';
import { DatabaseConnection } from '../DatabaseConnection/DatabaseConnection';

interface LiveConnectionResultProps {
  result: Result.Result;
  isFirstRowHeaderRow?: boolean;
  setIsFirstRowHeader?: (is: boolean) => void;
  onChangeColumnType?: (columnIndex: number, type?: TableCellType) => void;
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
  if (isDatabaseConnection(element)) {
    return <DatabaseConnection result={result} />;
  }

  if (element.type !== 'live-dataset' && showLiveQueryResults && result) {
    return (
      <div css={css(code)}>
        <CodeResult
          type={result.type}
          value={result.value}
          variant="block"
          isLiveResult
          firstTableRowControls={
            <ImportTableFirstRowControls
              isFirstRow={!isFirstRowHeaderRow}
              toggleFirstRowIsHeader={setIsFirstRowHeader}
            />
          }
          onChangeColumnType={onChangeColumnType}
          element={element}
        ></CodeResult>
      </div>
    );
  }

  return null;
};
