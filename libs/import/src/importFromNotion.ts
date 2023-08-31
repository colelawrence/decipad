import type {
  PageObjectResponse,
  QueryDatabaseResponse,
} from '@notionhq/client/build/src/api-endpoints';

export function importFromNotion(
  source: QueryDatabaseResponse
): Record<string, Array<string>> {
  const cleanResponse = filterNotionQuery(source);

  // Turns a parsed notion response into a json object
  const data: Record<string, Array<string>> = {};
  // Iterate through first row of json to get column names
  for (const column of cleanResponse[0]) {
    data[column.column_name] = [];
  }

  for (const row of cleanResponse) {
    for (const column of row) {
      data[column.column_name].push(column.value);
    }
  }
  return data;
}

export interface NotionResponse {
  type: string;
  column_name: string;
  value: string;
}

type ExtractRecord<R> = R extends Record<string, infer T> ? T : never;

// Each type has a different structure for data
// To access the plain values, we have to check
// per Notion type
// eslint-disable-next-line complexity
function getValue(
  object: ExtractRecord<PageObjectResponse['properties']>
): string {
  switch (object.type) {
    case 'title':
      return object.title[0].plain_text;
    case 'number':
      return object.number?.toString() ?? '0';
    case 'checkbox':
      return String(object.checkbox);
    case 'rich_text':
      return object.rich_text[0].plain_text;
    case 'select':
      return object.select?.name ?? '';
    case 'status':
      return object.status?.name ?? '';
    case 'date':
      return object.date?.start ?? '';
    case 'url':
      return object.url ?? '';
    case 'email':
      return object.email ?? '';
    case 'phone_number':
      return object.phone_number ?? '';
    case 'created_time':
      return object.created_time;
    case 'created_by':
      return object.created_by.id;
    case 'last_edited_time':
      return object.last_edited_time;
    case 'unique_id':
      return `${object.unique_id.prefix ?? ''}${object.unique_id.number ?? ''}`;
    // TODO: What to do with types below.
    case 'formula':
    case 'files':
    case 'people':
    case 'rollup':
    case 'relation':
    case 'multi_select':
    case 'last_edited_by':
      return '';
  }
}

function filterNotionQuery(
  source: QueryDatabaseResponse
): Array<Array<NotionResponse>> {
  const pageTable = [];

  for (const res of source.results) {
    // @see https://github.com/makenotion/notion-sdk-js/issues/331
    if ('properties' in res) {
      const page = res as PageObjectResponse;
      const pageRow = [];
      for (const property of Object.keys(page.properties)) {
        pageRow.push({
          type: page.properties[property].type,
          column_name: property,
          value: getValue(page.properties[property]),
        });
      }
      pageTable.push(pageRow);
    }
  }

  return pageTable;
}
