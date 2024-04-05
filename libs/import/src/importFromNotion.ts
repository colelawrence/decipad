import type {
  UserObjectResponse,
  PageObjectResponse,
  QueryDatabaseResponse,
  RichTextItemResponse,
  PartialUserObjectResponse,
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
      return richTextToString(object.title);
    case 'number':
      return object.number?.toString() ?? '0';
    case 'checkbox':
      return String(object.checkbox);
    case 'rich_text':
      return richTextToString(object.rich_text);
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
      return '';
    case 'people':
      return usersToString(object.people);
    case 'rollup':
    case 'relation':
      return '';
    case 'multi_select':
      let value = '';
      object.multi_select.sort((a, b) => (a.name < b.name ? 1 : -1));
      for (const select of object.multi_select) {
        value += select.name;
      }
      return value;
    case 'last_edited_by':
      return userToString(object.last_edited_by);

    //
    // Future proofing
    //
    // If notion types are lying to us and there are more,
    // let's handle them.
    //
    default:
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
