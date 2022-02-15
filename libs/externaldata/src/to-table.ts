import { Table } from 'apache-arrow';
import { csv } from './converters/csv';

const converters: Record<string, (source: string) => Promise<Table>> = {
  'text/csv': csv,
};

export async function toTable(
  contentType: string | undefined | null,
  source: string
): Promise<Table> {
  if (!contentType) {
    throw new Error('source has no defined content type');
  }
  const convert = converters[contentType];
  if (!convert) {
    throw new Error(
      `don't know how to convert from content of type "${contentType}" to a table`
    );
  }
  return convert(source);
}
