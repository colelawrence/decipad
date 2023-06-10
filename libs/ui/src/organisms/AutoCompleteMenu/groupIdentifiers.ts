import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import type { Identifier } from './AutoCompleteMenu';

export function groupIdentifiers(
  identifiers: Identifier[],
  isResult: boolean,
  result: string | null,
  isInTable: string
) {
  const {
    variable: variables = [],
    function: functions = [],
    column: columns = [],
  } = groupBy(identifiers, (ident) =>
    ident.kind === 'variable' && ident.type === 'table' ? 'column' : ident.kind
  ) as {
    [key: string]: Identifier[] | undefined;
  };

  const tableGroups = groupBy(columns, (col) =>
    col.type === 'table' ? col.identifier : col.inTable ?? ''
  );

  // Shouldn't happen, but just in case
  delete tableGroups[''];

  const isFocused = (i: Identifier) =>
    isResult && i.kind === 'variable' && i.identifier === result;

  const toGroup = (idents: Identifier[], title: string) => ({
    title,
    items: idents,
    tableName: undefined,
  });

  const toTableGroup = (idents: Identifier[], tableName: string) => ({
    title: `${tableName}`,
    tableName,
    items: idents.flatMap((ident): Identifier[] => {
      const { identifier } = ident;

      if (ident.kind === 'column' && isInTable === tableName) {
        // In a table, we can call our columns "Column1" or "TableName.Column1".
        const wholeColumn = `${tableName}.${identifier}`;

        return [
          {
            ...ident,
            explanation: `The cell ${identifier}`,
            inTable: tableName,
            isCell: true,
            decoration: 'cell',
          },
          {
            ...ident,
            identifier: wholeColumn,
            explanation: `The column ${identifier} from table ${tableName} as a list.`,
            inTable: tableName,
            isCell: false,
          },
        ];
      }

      return [
        {
          ...ident,
          inTable: tableName,
        },
      ];
    }),
  });

  return sortBy(
    [
      toGroup(variables, 'Variables'),
      ...Object.entries(tableGroups).map(([tbl, idents]) =>
        toTableGroup(idents, tbl)
      ),
      toGroup(functions, 'Formulas'),
    ],
    (g) => {
      if (isInTable === g.tableName) {
        return 0;
      }
      return 1;
    }
  ).flatMap((g) => {
    if (g.items.length > 0) {
      return {
        ...g,
        items: g.items.map((i) => ({
          ...i,
          focused: isFocused(i),
        })),
      };
    }
    return [];
  });
}
