import { runUserQuery } from '@decipad/backend-external-db';

const mysqlSchemaQuery = `SELECT 
  c.TABLE_NAME, 
  c.COLUMN_NAME, 
  c.DATA_TYPE, 
  c.COLUMN_DEFAULT, 
  c.IS_NULLABLE,
  kcu.CONSTRAINT_NAME,
  kcu.REFERENCED_TABLE_NAME,
  kcu.REFERENCED_COLUMN_NAME
FROM 
  INFORMATION_SCHEMA.COLUMNS as c
LEFT JOIN 
  INFORMATION_SCHEMA.KEY_COLUMN_USAGE as kcu
ON 
  c.TABLE_NAME = kcu.TABLE_NAME 
  AND c.COLUMN_NAME = kcu.COLUMN_NAME
  AND c.TABLE_SCHEMA = kcu.TABLE_SCHEMA
WHERE 
  c.TABLE_SCHEMA = DATABASE();`;

type SchemaRes = { [k: string]: (string | null)[] };

const stringifySchemaRes = (schemaRes: SchemaRes): string => {
  const headers = Object.keys(schemaRes);
  // Get the number of rows based on the length of the first array in the object
  const numberOfRows = schemaRes[headers[0]].length;

  // Initialize the result string with the headers
  let result = `${headers.join('  ')}\n`;

  // Iterate over each row
  for (let i = 0; i < numberOfRows; i += 1) {
    // For each row, map each header to its corresponding value
    const row = headers.map((header) => schemaRes[header][i] ?? 'null');
    // Join the values with spaces and add to the result string
    result += `${row.join('  ')}\n`;
  }
  return result;
};

export const getSchemaString = async (externalId: string): Promise<string> => {
  const schemaRes = (await runUserQuery(
    externalId,
    mysqlSchemaQuery
  )) as SchemaRes;

  return stringifySchemaRes(schemaRes);
};
