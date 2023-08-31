import { resource } from '@decipad/backend-resources';
import { Client, ClientErrorCode, isNotionClientError } from '@notionhq/client';
import { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import { GraphqlContext } from '../../../backendtypes/src';
import { thirdParty } from '../../../backend-config/src';

const notebooks = resource('notebook');

const notion = new Client({
  auth: thirdParty().notion.apiKey,
});

const resolvers = {
  Query: {
    async getNotion(
      _: unknown,
      { url, notebookId }: { url: string; notebookId: string },
      context: GraphqlContext
    ): Promise<string> {
      await notebooks.expectAuthorizedForGraphql({
        context,
        recordId: notebookId,
        minimumPermissionType: 'READ',
      });

      // The database ID comes from the 32-character ID between
      // the last slash and the first URL argument
      const databaseId = url.split('/').at(-1)?.split('?').at(0);

      try {
        const queryData: QueryDatabaseResponse = await notion.databases.query({
          database_id: `${databaseId}`,
        });

        return JSON.stringify(queryData);
      } catch (err: unknown) {
        if (isNotionClientError(err)) {
          switch (err.code) {
            case ClientErrorCode.ResponseError:
              throw new Error(
                `An error happened with your response: ${err.body}`
              );
            case ClientErrorCode.RequestTimeout:
              throw new Error('Request timed out, try again in a few minutes.');
          }
        }

        throw new Error('An error has occured');
      }
    },
  },
};

export default resolvers;
