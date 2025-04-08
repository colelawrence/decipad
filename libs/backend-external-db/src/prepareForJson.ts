const NUMERIC_TYPES_LOWERCASED = new Set([
  'numeric',
  'bignumeric',
  'float64',
  'float',
  'float4',
  'float8',
  'int64',
  'int',
  'int2',
  'int4',
  'int8',
  'bigint',
  'bigint64',
  'integer',
  'decimal',
  'double',
  'double precision',
  'smallint',
  'tinyint',
  'mediumint',
  'real',
  'number',
  'money',
  'serial',
  'serial2',
  'serial4',
  'serial8',
  'bigserial',
  'smallserial',
  'dec',
  'fixed',
  'year',
  'bit',
]);

const BOOLEAN_TYPES_LOWERCASED = new Set(['boolean', 'bool']);

const preparingCellForJSON = (type: string) => {
  const parseCell = (cell: unknown): unknown => {
    if (cell == null) {
      return cell;
    }
    if (NUMERIC_TYPES_LOWERCASED.has(type)) {
      const coerced = Number(cell);
      if (Number.isNaN(coerced)) {
        return cell;
      }
      return coerced;
    }
    if (BOOLEAN_TYPES_LOWERCASED.has(type)) {
      return cell.toString().toLowerCase() === 'true';
    }
    return cell;
  };

  return (cell: unknown): unknown => {
    if (cell != null && typeof cell === 'object' && 'value' in cell) {
      return parseCell(cell.value);
    }
    return parseCell(cell);
  };
};

export const prepareForJSON = (
  data: Record<string, Array<unknown>>,
  fields: Record<string, string>
): Record<string, Array<unknown>> =>
  Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      (Array.isArray(value) ? value : [value]).map(
        preparingCellForJSON(fields[key]?.toLowerCase() ?? '')
      ),
    ])
  );
