const preparingCellForJSON =
  (type: string) =>
  (cell: unknown): unknown => {
    if (cell == null) {
      return cell;
    }
    switch (type) {
      case 'NUMERIC':
        return Number(cell);
    }
    return (
      (typeof cell === 'object' && 'value' in cell
        ? (cell as { value: unknown }).value
        : cell) ?? cell
    );
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
