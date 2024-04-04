import type { LogRecord, User } from '@decipad/backendtypes';
import { expectAuthenticated } from '@decipad/services/authentication';
import { getDefined } from '@decipad/utils';
import Boom from '@hapi/boom';
import tables from '@decipad/tables';
import handle from '../handle';
import { app } from '@decipad/backend-config';

const outputJSON = (json: string) =>
  JSON.stringify(JSON.parse(json), null, '\t');

const outputEntry = (entry: LogRecord): string => {
  return `<tr>
  <td>${new Date((entry.createdAt ?? 0) * 1000)
    .toISOString()
    .split('T')
    .join(' ')}</td>
  <td>${entry.user_id}</td>
  <td>${entry.source}</td>
  <td>${outputJSON(entry.content)}</td>
</tr>`;
};

async function checkAccess(user: User | undefined) {
  if (!user) {
    throw Boom.forbidden('Needs authentication');
  }

  const data = await tables();
  const superAdmin = await data.superadminusers.get({ id: user.id });
  if (!superAdmin) {
    throw Boom.forbidden('user is not in the superadmins list');
  }
}

export const handler = handle(async (event) => {
  const padId = getDefined(getDefined(event.pathParameters).padid);

  const [{ user }] = await expectAuthenticated(event);
  await checkAccess(user);

  const { from, page = '1' } = event.queryStringParameters ?? {};

  const data = await tables();
  let output = '';
  let entryCount = 0;

  const resource = `/pads/${padId}`;
  console.log('resource:', resource);

  const result = await data.logs.query({
    KeyConditionExpression: '#resource = :resource',
    ExpressionAttributeNames: {
      '#resource': 'resource',
    },
    ExpressionAttributeValues: {
      ':resource': resource,
    },
    ExclusiveStartKey: from && JSON.parse(from),
    Limit: 50,
  });

  for (const entry of result.Items) {
    if (entry) {
      entryCount += 1;
      output += outputEntry(entry);
    }
  }

  const cursor =
    result.LastEvaluatedKey && JSON.stringify(result.LastEvaluatedKey);

  console.log(event.rawPath);
  const nextUrl = new URL(event.rawPath, app().urlBase);
  nextUrl.searchParams.set('page', (parseInt(page, 10) + 1).toString());
  if (cursor) {
    nextUrl.searchParams.set('from', cursor);
  }
  if (from) {
    nextUrl.searchParams.set('previous', from);
  }
  const nextLink = cursor
    ? `<a href="${nextUrl.toString()}">Next</a>`
    : 'No more entries';

  const body = `
<html>
  <head>
    <link rel="stylesheet"
      href="https://unpkg.com/purecss@2.0.6/build/pure-min.css"
      integrity="sha384-Uu6IeWbM+gzNVXJcM9XV3SohHtmWE+3VGi496jvgX1jyvDTXfdK+rfZc8C1Aehk5"
      crossorigin="anonymous"
      origin="anonymous"
    />

      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      .container {
        margin-top: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      }
      h1 {
        color: green;
      }
      .pure-table td {
        max-width: 800px;
        overflow-x: scroll;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div>
        <h1>Showing ${entryCount} log entries</h1>
        <h2>Page ${page} > ${nextLink}</h2>
        <p></p>
        <table class="pure-table pure-table-striped">
          <thead>
            <tr>
              <th>When</th>
              <th>Who</th>
              <th>Which</th>
              <th>What</th>
            </tr>
          </thead>
          <tbody>
            ${output}
          </tbody>
        </table>
      </div>
    </div>
  </body>
</html>
`;

  return {
    statusCode: 200,
    headers: {
      'content-type': 'text/html',
    },
    body,
  };
});
