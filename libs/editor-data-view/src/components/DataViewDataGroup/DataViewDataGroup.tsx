import { isCellAlignRight } from 'libs/editor-table/src/components';
import { FC, useCallback, useEffect, useState } from 'react';
import type { Subscription } from 'rxjs';
import type { AggregationKind, DataGroup } from '../../types';
import type { Element as GroupElement } from '../../utils/types';
import type { HeaderProps, SmartProps } from '../DataViewDataLayout';

interface DataViewDataGroupElementProps {
  tableName: string;
  element: GroupElement<DataGroup>;
  Header: FC<HeaderProps>;
  SmartCell: FC<SmartProps>;
  aggregationType: AggregationKind | undefined;
  roundings: Array<string | undefined>;
  isFullWidthRow: boolean;
  expandedGroups: string[] | undefined;
  onChangeExpandedGroups: (expandedGroups: string[]) => void;
  groupLength: number;
  index: number;
  rotate: boolean;
  isFirstLevel: boolean;
}

export const DataViewDataGroupElement: FC<DataViewDataGroupElementProps> = ({
  tableName,
  element,
  Header,
  SmartCell,
  aggregationType,
  roundings,
  isFullWidthRow,
  expandedGroups,
  onChangeExpandedGroups,
  groupLength,
  index,
  rotate,
  isFirstLevel,
}) => {
  const [parentHover, setParentHover] = useState(false);
  const [selfHover, setSelfHover] = useState(false);

  useEffect(() => {
    let sub: Subscription;
    if (element.parentHighlight$) {
      sub = element.parentHighlight$.subscribe(setParentHover);
    }
    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, [element.parentHighlight$]);

  useEffect(() => {
    element.selfHighlight$?.next(parentHover || selfHover);
  }, [element.selfHighlight$, parentHover, selfHover]);

  const onHover = useCallback(
    (hover: boolean) => {
      setSelfHover(hover);
      if (element.selfHighlight$) {
        element.selfHighlight$.next(selfHover);
      }
    },
    [element.selfHighlight$, selfHover]
  );

  return element.elementType === 'group' ? (
    <Header
      type={element.type}
      value={element.value}
      rowSpan={element.rowspan}
      colSpan={element.colspan}
      collapsible={element.collapsible}
      onHover={onHover}
      hover={parentHover || selfHover}
      alignRight={isCellAlignRight(element.type)}
      isFullWidthRow={isFullWidthRow}
      expandedGroups={expandedGroups}
      onChangeExpandedGroups={onChangeExpandedGroups}
      groupId={element.id || ''}
      groupLength={groupLength}
      index={index}
      global={element.global}
      rotate={rotate}
      isFirstLevelHeader={isFirstLevel}
    />
  ) : (
    <SmartCell
      tableName={tableName}
      rowSpan={element.rowspan}
      colSpan={element.colspan}
      column={element.column}
      roundings={roundings}
      aggregationType={aggregationType}
      onHover={onHover}
      hover={parentHover || selfHover}
      alignRight={isCellAlignRight(element.column?.type)}
      previousColumns={element.previousColumns}
      global={element.global}
      rotate={rotate}
    />
  );
};
