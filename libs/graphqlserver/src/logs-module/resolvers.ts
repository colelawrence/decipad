import tables, { timestamp } from '@decipad/tables';
import { GraphqlContext } from '@decipad/backendtypes';
import { nanoid } from 'nanoid';
import { requireUser } from '../authorization';

const EXPIRATION_TIME_SECONDS = 15 * 24 * 60 * 60;

export interface LogEntry {
  source: string;
  createdAt: Date | string;
  content: string;
}

const resolvers = {
  Mutation: {
    async createLogs(
      _: unknown,
      args: { input: { resource: string; entries: LogEntry[] } },
      context: GraphqlContext
    ) {
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
    },
  },
};

export default resolvers;
