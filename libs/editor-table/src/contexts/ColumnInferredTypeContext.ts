import { createContext, useContext } from 'react';
import { CellValueType } from '@decipad/editor-types';
import { BehaviorSubject } from 'rxjs';
import { useBehaviorSubject } from '@decipad/react-utils';
import { getDefined } from '@decipad/utils';

type ObservableColumnType = CellValueType | undefined;

type ColumnInferredTypeContextValue = {
  setColumnType: (index: number, type: ObservableColumnType) => void;
  getColumnType: (
    index?: number
  ) => BehaviorSubject<ObservableColumnType> | undefined;
};

export const createDefaultColumnInferredTypeContextValue = () => {
  const columns: Array<BehaviorSubject<ObservableColumnType>> = [];

  const getColumnType = (index?: number) => {
    if (index == null) {
      return undefined;
    }
    let col = columns[index];
    if (!col) {
      col = new BehaviorSubject<ObservableColumnType>(undefined);
      columns[index] = col;
    }
    return col;
  };

  const setColumnType = (index: number, newType: ObservableColumnType) => {
    const col = getDefined(getColumnType(index));
    col.next(newType);
  };

  return {
    setColumnType,
    getColumnType,
  };
};

export const ColumnInferredTypeContext =
  createContext<ColumnInferredTypeContextValue>(
    createDefaultColumnInferredTypeContextValue()
  );

const undefinedBehaviourSubject = new BehaviorSubject<ObservableColumnType>(
  undefined
);

export const useColumnInferredTypeFromContext = (
  columnIndex?: number
): ObservableColumnType => {
  const context = useContext(ColumnInferredTypeContext);
  const subject =
    context.getColumnType(columnIndex) ?? undefinedBehaviourSubject;
  return useBehaviorSubject(subject);
};
