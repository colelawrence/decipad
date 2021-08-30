import * as ExternalData from './external-data-types';
import defaultFetch from './default-fetch';
import { resolveCsv } from './resolve-csv';
import { resolveArrow } from './resolve-arrow';
import { DataTable } from './DataTable';

export { defaultFetch, ExternalData };

type IResolve = {
  url: string;
  fetch: ExternalData.FetchFunction;
  contentType?: string | undefined | null;
  maxRows?: number | undefined;
};

type Resolver = (
  body: AsyncIterable<ArrayBuffer>,
  maxRows: number
) => Promise<DataTable>;

type Resolvers = Record<string, Resolver>;

const resolvers: Resolvers = {
  'text/csv': resolveCsv,
  'application/x-apache-arrow-stream': resolveArrow,
};

export async function resolve({
  url,
  contentType,
  maxRows = Infinity,
  fetch,
}: IResolve): Promise<DataTable> {
  const response = await fetch(url);
  if (!contentType) {
    contentType = response.contentType;
  }
  return resolveForContentType(
    response.result,
    contentType || 'text/csv',
    maxRows
  );
}

function resolveForContentType(
  response: AsyncIterable<ArrayBuffer>,
  contentType: string,
  maxRows: number
): Promise<DataTable> {
  const resolve = resolvers[contentType];
  if (!resolve) {
    throw new Error(`don't know how to handle content type ${contentType}`);
  }
  return resolve(response, maxRows);
}
