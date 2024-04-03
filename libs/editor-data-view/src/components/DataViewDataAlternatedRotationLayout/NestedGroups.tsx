import { FC } from 'react';
import { DataGroup, AggregationKind } from '../../types';
import { DataViewDataGroupElement } from '../DataViewDataGroup/DataViewDataGroup';
import { DataViewTableHeader } from '../DataViewTableHeader';
import { SmartCell } from '../SmartCell';
import { getAggregationShortName } from '../../../../language-aggregations/src/aggregations';

interface NestedGroupsProps {
  groups: DataGroup[];
  tableName: string;
  expandedGroups: string[];
  rotate: boolean;
  onChangeExpandedGroups: (expandedGroups: string[]) => void;
  aggregationTypes: Array<AggregationKind | undefined>;
  columnIndex: number;
}

export const NestedGroups: FC<NestedGroupsProps> = ({
  groups,
  tableName,
  expandedGroups,
  rotate,
  onChangeExpandedGroups,
  aggregationTypes,
  columnIndex,
}) => {
  const aggregationTypeName = getAggregationShortName(
    aggregationTypes[columnIndex]
  );
  return (
    <table>
      {rotate ? (
        <>
          <tr>
            {groups.map((group) => (
              <DataViewDataGroupElement
                element={group}
                rotate={rotate}
                expandedGroups={expandedGroups}
                aggregationType={aggregationTypeName}
                isFullWidthRow={false}
                groupLength={1}
                onChangeExpandedGroups={onChangeExpandedGroups}
                index={0}
                isFirstLevel
                Header={DataViewTableHeader}
                SmartCell={SmartCell}
                alignRight={false}
              />
            ))}
          </tr>
          <tr>
            {groups.map((group) => (
              <th>
                <NestedGroups
                  groups={group.children}
                  tableName={tableName}
                  expandedGroups={expandedGroups}
                  rotate={!rotate}
                  onChangeExpandedGroups={onChangeExpandedGroups}
                  aggregationTypes={aggregationTypes}
                  columnIndex={columnIndex + 1}
                />
              </th>
            ))}
          </tr>
        </>
      ) : (
        groups.map((group) => (
          <tr>
            <DataViewDataGroupElement
              element={group}
              rotate={rotate}
              expandedGroups={expandedGroups}
              aggregationType={aggregationTypeName}
              isFullWidthRow={false}
              groupLength={1}
              onChangeExpandedGroups={onChangeExpandedGroups}
              index={0}
              isFirstLevel
              Header={DataViewTableHeader}
              SmartCell={SmartCell}
            />
            <th>
              <NestedGroups
                groups={group.children}
                tableName={tableName}
                expandedGroups={expandedGroups}
                rotate={!rotate}
                onChangeExpandedGroups={onChangeExpandedGroups}
                aggregationTypes={aggregationTypes}
                columnIndex={columnIndex + 1}
              />
            </th>
          </tr>
        ))
      )}
    </table>
  );
};
