import tables, { timestamp } from '@decipad/tables';
import { nanoid } from 'nanoid';
import { requireUser } from '../authorization';
import { Resolvers } from '@decipad/graphqlserver-types';

const EXPIRATION_TIME_SECONDS = 30 * 24 * 60 * 60; // 30 days

export interface LogEntry {
  source: string;
  createdAt: Date | string;
  content: string;
}

const resolvers: Resolvers = {
  Mutation: {
    async createLogs(_, args, context) {
      const user = requireUser(context);
      const data = await tables();
      const expiresAt = timestamp() + EXPIRATION_TIME_SECONDS;
      const { input } = args;
      for (const log of input.entries) {
        // eslint-disable-next-line no-await-in-loop
        await data.logs.put({
          resource: input.resource,
          seq: `${Date.now()}:${nanoid()}`,
          id: nanoid(),
          createdAt: timestamp(new Date(log.createdAt)),
          source: log.source,
          user_id: user.id,
          content: log.content,
          expiresAt,
        });
      }

      return true;
    },
  },
};

export default resolvers;
