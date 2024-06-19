import type { TableCellType } from '@decipad/editor-types';
import type {
  UserObjectResponse,
  PageObjectResponse,
  QueryDatabaseResponse,
  RichTextItemResponse,
  PartialUserObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

export function importFromNotion(
  source: QueryDatabaseResponse
): [Record<string, Array<string>>, Array<TableCellType | undefined>] {
  const cleanResponse = filterNotionQuery(source);

  // Turns a parsed notion response into a json object
  const data: Record<string, Array<string>> = {};
  const cohersingTypes: Array<TableCellType | undefined> = [];

  // Iterate through first row of json to get column names
  for (const column of cleanResponse[0]) {
    data[column.column_name] = [];
    cohersingTypes.push(column.cohersion);
  }

  for (const row of cleanResponse) {
    for (const column of row) {
      data[column.column_name].push(column.value);
    }
  }

  return [data, cohersingTypes];
}

interface ImportDatabaseResult {
  id: string;
  name: string;
}

function richTextToString(richText: Array<RichTextItemResponse>): string {
  let title = '';

  for (const text of richText) {
    if (text.type !== 'text') {
      continue;
    }

    title += text.plain_text;
  }

  return title;
}

function usersToString(
  users: Array<UserObjectResponse | PartialUserObjectResponse>
): string {
  let text = '';

  for (const user of users) {
    text += userToString(user);
  }

  return text;
}

function userToString(
  user: UserObjectResponse | PartialUserObjectResponse
): string {
  if (!('type' in user)) {
    return '';
  }

  if (user.type === 'bot') {
    return user.name ?? 'Robot';
  }

  return user.name ?? user.person.email ?? '';
}

export function importDatabases(
  source: Array<{
    object: string;
    id: string;
    title: Array<RichTextItemResponse>;
    properties: Record<string, QueryDatabaseResponse['results']>;
  }>
): Array<ImportDatabaseResult> {
  const databases: Array<ImportDatabaseResult> = [];

  for (const item of source) {
    if (item.object !== 'database') {
      continue;
    }

    databases.push({
      id: item.id,
      name: richTextToString(item.title),
    });
  }

  return databases;
}

export interface NotionResponse {
  type: string;
  column_name: string;
  value: string;
  cohersion: TableCellType | undefined;
}

type ExtractRecord<R> = R extends Record<string, infer T> ? T : never;

// Each type has a different structure for data
// To access the plain values, we have to check
// per Notion type
// eslint-disable-next-line complexity
function getValue(
  object: ExtractRecord<PageObjectResponse['properties']>
): [string, TableCellType | undefined] {
  switch (object.type) {
    case 'title':
      return [richTextToString(object.title), undefined];
    case 'number':
      return [object.number?.toString() ?? '0', undefined];
    case 'checkbox':
      return [String(object.checkbox), undefined];
    case 'rich_text':
      return [richTextToString(object.rich_text), undefined];
    case 'select':
      return [object.select?.name ?? '', undefined];
    case 'status':
      return [object.status?.name ?? '', undefined];
    case 'date':
      return [object.date?.start ?? '', undefined];
    case 'url':
      return [object.url ?? '', undefined];
    case 'email':
      return [object.email ?? '', undefined];
    case 'phone_number':
      return [object.phone_number ?? '', { kind: 'string' }];
    case 'created_time':
      return [object.created_time, undefined];
    case 'created_by':
      return [object.created_by.id, undefined];
    case 'last_edited_time':
      return [object.last_edited_time, undefined];
    case 'unique_id':
      return [
        `${object.unique_id.prefix ?? ''}${object.unique_id.number ?? ''}`,
        undefined,
      ];
    // TODO: What to do with types below.
    case 'formula':
    case 'files':
      return ['', undefined];
    case 'people':
      return [usersToString(object.people), undefined];
    case 'rollup':
    case 'relation':
      return ['', undefined];
    case 'multi_select':
      let value = '';
      object.multi_select.sort((a, b) => (a.name < b.name ? 1 : -1));
      for (const select of object.multi_select) {
        value += select.name;
      }
      return [value, undefined];
    case 'last_edited_by':
      return [userToString(object.last_edited_by), undefined];

    //
    // Future proofing
    //
    // If notion types are lying to us and there are more,
    // let's handle them.
    //
    default:
      return ['', undefined];
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
        const [value, cohersion] = getValue(page.properties[property]);
        pageRow.push({
          type: page.properties[property].type,
          column_name: property,
          value,
          cohersion,
        });
      }
      pageTable.push(pageRow);
    }
  }

  return pageTable;
}
