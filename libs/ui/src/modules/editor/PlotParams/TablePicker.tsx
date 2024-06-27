import { TableSmall } from 'libs/ui/src/icons';
import { Divider, MenuItem } from 'libs/ui/src/shared';
import { constMenuMinWidth } from './styles';
import { TablePickerProps } from './types';

export const TablePicker = ({
  sourceVarNameOptions,
  sourceExprRefOptions,
  setSourceVarName,
  resetChart,
}: TablePickerProps) => {
  const hasOptsToRender =
    sourceVarNameOptions && sourceVarNameOptions.length > 0;
  return (
    <>
      <MenuItem
        key={'pick-a-table'}
        icon={<TableSmall />}
        onSelect={(ev) => {
          ev.preventDefault();
        }}
      >
        <div css={constMenuMinWidth}>Pick a table</div>
      </MenuItem>
      <Divider />
      {!hasOptsToRender && (
        <MenuItem key={'no-options'} disabled>
          <div css={constMenuMinWidth}>No available tables</div>
        </MenuItem>
      )}
      {sourceVarNameOptions.map((svn, index) => {
        return (
          <MenuItem
            key={svn}
            onSelect={() => {
              resetChart();
              setSourceVarName(sourceExprRefOptions?.[index] ?? svn);
            }}
          >
            <div css={constMenuMinWidth}>{svn}</div>
          </MenuItem>
        );
      })}
    </>
  );
};
