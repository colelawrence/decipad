import parseCSV, { Options as ParseCSVOptions } from 'csv-parse';
import { TabularData } from './TabularData';
import * as ExternalData from './external-data-types';

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
      return await resolveCSV(response, maxRows);
    }
    default: {
      throw new Error("don't know how to handle content type " + contentType);
    }
  }
}

async function resolveCSV(
  response: AsyncIterable<ArrayBuffer>,
  maxRows: number
): Promise<TabularData> {
  return new Promise((resolve, reject) => {
    const data = new TabularData();
    const options: ParseCSVOptions = {
      cast: true,
      cast_date: (d: string): Date => {
        let n = Date.parse(d + 'Z');
        if (isNaN(n)) {
          n = Date.parse(d);
        }
        if (!isNaN(n)) {
          return new Date(n);
        }
        return d as any as Date;
      },
    };
    const parser = parseCSV(options);
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
