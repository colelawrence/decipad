import { isCellAlignRight } from 'libs/editor-table/src/components';
import { FC, useCallback, useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import { AggregationKind, DataGroup } from '../../types';
import { Element as GroupElement } from '../../utils/treeToTable';
import { HeaderProps, SmartProps } from '../DataViewDataLayout';

interface DataViewDataGroupElementProps {
  tableName: string;
  element: GroupElement<DataGroup>;
  Header: FC<HeaderProps>;
  SmartCell: FC<SmartProps>;
  aggregationType: AggregationKind | undefined;
}

const DataViewDataGroupElement: FC<DataViewDataGroupElementProps> = ({
  tableName,
  element,
  Header,
  SmartCell,
  aggregationType,
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
      onHover={onHover}
      hover={parentHover || selfHover}
      alignRight={isCellAlignRight(element.type)}
    />
  ) : (
    <SmartCell
      tableName={tableName}
      rowSpan={element.rowspan}
      colSpan={element.colspan}
      column={element.column}
      aggregationType={aggregationType}
      onHover={onHover}
      hover={parentHover || selfHover}
      alignRight={isCellAlignRight(element.column.type)}
      subproperties={element.subproperties}
    />
  );
};

interface DataViewDataGroupProps {
  tableName: string;
  group: GroupElement<DataGroup>[];
  selectedAggregationTypes: Array<AggregationKind | undefined>;
  Header: FC<HeaderProps>;
  SmartCell: FC<SmartProps>;
}

export const DataViewDataGroup: FC<DataViewDataGroupProps> = ({
  tableName,
  group,
  selectedAggregationTypes,
  Header,
  SmartCell,
}: DataViewDataGroupProps) => {
  return (
    <>
      {group.map((element, index) => (
        <DataViewDataGroupElement
          key={index}
          tableName={tableName}
          element={element}
          aggregationType={selectedAggregationTypes[element.columnIndex]}
          Header={Header}
          SmartCell={SmartCell}
        />
      ))}
    </>
  );
};
