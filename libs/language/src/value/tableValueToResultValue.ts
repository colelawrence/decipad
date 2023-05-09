import { Table } from '.';
import { Interpreter } from '../interpreter';
import { columnValueToResultValue } from './columnValueToResultValue';

export const tableValueToTableResultValue = (
  v: Table
): Interpreter.ResultTable => v.columns.map(columnValueToResultValue);
