import type { Result } from '@decipad/language-interfaces';
import { ReactNode, type FC } from 'react';
import {
  CodeResult,
  EmptyDataSet,
  LoadingFilter,
  LoadingIndicator,
  VariableTypeMenu,
} from '@decipad/ui';
import { Settings } from 'libs/ui/src/icons';
import {
  ChangeVariableTypeButton,
  ResultPreviewTableWrapper,
  ResultPreviewVariableWrapper,
} from './styles';
import { assert } from '@decipad/utils';
import {
  ChangableTableOptions,
  ChangableVariableOptions,
  ConnectionTable,
} from '../integration/ConnectionTable/ConnectionTable';
import { ConnectionProps } from './types';
import {
  UseDelayedResultReturn,
  useDelayedResult,
} from '@decipad/editor-hooks';

type ResultPreviewCommonProps = {
  id: string;
  varNameInput?: ReactNode;
  hiddenColumns: Array<string>;
};

type ConcreteResultPreview = ResultPreviewCommonProps & {
  result: Result.Result | undefined;
};

const ResultPreviewPending: FC = () => {
  return <LoadingIndicator />;
};

const ResultPreviewTable: FC<ConcreteResultPreview & ChangableTableOptions> = ({
  result,
  varNameInput,

  hiddenColumns,

  onChangeColumnType,
  onToggleHideColumn,
  onChangeColumnName,
}) => {
  assert(result != null, 'unreachable');
  assert(result.type.kind === 'table', 'should always be table result');

  return (
    <ResultPreviewTableWrapper data-testid="result-preview">
      {varNameInput}
      <ConnectionTable
        type="allow-changes"
        tableResult={result as Result.Result<'table'>}
        hiddenColumns={hiddenColumns}
        onChangeColumnType={onChangeColumnType}
        onToggleHideColumn={onToggleHideColumn}
        onChangeColumnName={onChangeColumnName}
      />
    </ResultPreviewTableWrapper>
  );
};

const ResultPreviewVariable: FC<
  ConcreteResultPreview & ChangableVariableOptions
> = ({ result, varNameInput, onChangeVariableType }) => {
  assert(result != null, 'unreachable');

  return (
    <ResultPreviewVariableWrapper>
      {varNameInput}
      <CodeResult {...result} variant="block" isResultPreview isLiveResult />
      <VariableTypeMenu
        trigger={
          <ChangeVariableTypeButton>
            <span data-testid="type-picker-button">
              <Settings />
            </span>
            <span>Settings</span>
          </ChangeVariableTypeButton>
        }
        onChangeType={onChangeVariableType}
        type={result.type}
      />
    </ResultPreviewVariableWrapper>
  );
};

const isRectangularTable = (result: Result.Result): boolean => {
  if (result.type.kind !== 'table') {
    return false;
  }

  const columnKinds = result.type.columnTypes.map((c) => c.kind);

  return columnKinds.every(
    (c) =>
      c !== 'column' &&
      c !== 'table' &&
      c !== 'materialized-column' &&
      c !== 'materialized-table'
  );
};

const ResultPreviewWithResult: FC<
  ResultPreviewCommonProps &
    ChangableVariableOptions &
    ChangableTableOptions &
    UseDelayedResultReturn
> = ({ result, ...props }) => {
  if (result == null) {
    return null;
  }

  switch (result.type.kind) {
    case 'pending':
      return <ResultPreviewPending />;
    case 'table':
      return isRectangularTable(result) ? (
        <ResultPreviewTable {...props} result={result} />
      ) : (
        <>Non rectangular table</>
      );
    default:
      return <ResultPreviewVariable {...props} result={result} />;
  }
};

export const ResultPreview: FC<
  ResultPreviewCommonProps & ChangableVariableOptions & ChangableTableOptions
> = (props) => {
  const resultState = useDelayedResult(props.id);

  return (
    <LoadingFilter
      loading={resultState.state === 'loading'}
      variant="fullWidth"
    >
      <ResultPreviewWithResult {...props} {...resultState} />
    </LoadingFilter>
  );
};

export const PortalledPreview: FC<
  ConnectionProps & { varNameInput: ReactNode }
> = ({
  varName,
  id,
  runner,
  onRun,
  onChangeColumnName,
  onToggleHideColumn,
  hiddenColumns,
  varNameInput,
}) => {
  if (id == null) {
    return <EmptyDataSet />;
  }

  return (
    <ResultPreview
      varNameInput={varNameInput}
      id={id}
      onChangeColumnType={(colName, t) => {
        runner.setColumnType(colName, t);
        onRun();
      }}
      hiddenColumns={hiddenColumns}
      onToggleHideColumn={onToggleHideColumn}
      onChangeColumnName={onChangeColumnName}
      onChangeVariableType={(t) => {
        runner.setColumnType(varName, t);
        onRun();
      }}
    />
  );
};
