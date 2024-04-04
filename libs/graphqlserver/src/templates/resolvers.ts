import { searchTemplates } from '@decipad/backend-search';
import { requireUser } from '../authorization';
import type { Resolvers } from '@decipad/graphqlserver-types';

const resolvers: Resolvers = {
  Query: {
    async searchTemplates(_, { prompt, faster, page }, context) {
      requireUser(context);

      const { maxItems, cursor: cursorString = '0' } = page;
      const cursor = parseInt(cursorString as string, 10);
      const results = await searchTemplates(prompt, {
        faster,
        startIndex: cursor,
        maxResults: maxItems + 1,
      });

      const userResultSize =
        results.length > maxItems ? maxItems : results.length;

      return {
        cursor: String(cursor + results.length),
        hasNextPage: userResultSize < results.length,
        count: userResultSize,
        items: results.slice(0, userResultSize),
      };
    },
  },
};

export default resolvers;
