import parseCSV from 'csv-parse';
import { TabularData } from './TabularData';
import * as ExternalData from './external-data-types';
import { cast } from './cast';

export { ExternalData };

type IResolve = {
  url: string;
  fetch: ExternalData.FetchFunction;
  contentType?: string | undefined | null;
  maxRows?: number | undefined;
};

export async function resolve({
  url,
  contentType,
  maxRows = Infinity,
  fetch,
}: IResolve): Promise<TabularData> {
  const response = await fetch(url);
  if (!contentType) {
    contentType = response.contentType;
  }
  return await resolveForContentType(
    response.result,
    contentType || 'text/csv',
    maxRows
  );
}

async function resolveForContentType(
  response: AsyncIterable<ArrayBuffer>,
  contentType: string,
  maxRows: number
): Promise<TabularData> {
  switch (contentType) {
    case 'text/csv': {
      return await resolveCsv(response, maxRows);
    }
    default: {
      throw new Error("don't know how to handle content type " + contentType);
    }
  }
}

export async function resolveCsv(
  response: AsyncIterable<ArrayBuffer>,
  maxRows: number
): Promise<TabularData> {
  return new Promise((resolve, reject) => {
    const data = new TabularData();
    const parser = parseCSV({ cast });
    let parserEnded = false;
    let isDone = false;
    let hadFirstRow = false;
    parser.on('readable', () => {
      let row: any[];
      while ((row = parser.read())) {
        if (!isDone) {
          if (!hadFirstRow) {
            data.setColumnNames(row);
            hadFirstRow = true;
          } else {
            data.addRow(row);
            if (data.length >= maxRows) {
              isDone = true;
              resolve(data);
            }
          }
        }
      }
    });
    parser.once('end', () => {
      parserEnded = true;
      isDone = true;
      resolve(data);
    });
    parser.once('error', reject);

    (async () => {
      try {
        for await (const content of response) {
          parser.write(content);
          if (isDone) {
            parserEnded = true;
            parser.end();
          }
        }
      } catch (err) {
        reject(err);
      } finally {
        if (!parserEnded) {
          parser.end();
        }
      }
    })();
  });
}
