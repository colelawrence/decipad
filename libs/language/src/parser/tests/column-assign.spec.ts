import { col, tableColAssign } from '../../utils';
import { runTests } from '../run-tests';

runTests({
  'can assign cols to tables': {
    source: 'TableName.ColumnName = [1]',
    sourceMap: false,
    ast: [tableColAssign('TableName', 'ColumnName', col(1))],
  },
});
