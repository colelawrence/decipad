import assert from 'assert';
import { encode as encodeJWT } from 'next-auth/jwt';
import arc from '@architect/functions';
import { ApolloLink } from '@apollo/client';
import { User } from '@decipad/backendtypes';

export interface AuthReturnValue {
  token: string;
  user?: User;
  secret?: string;
  gotFromSecProtocolHeader?: boolean;
  link?: ApolloLink | undefined;
}

export default ({ tablesPort }: { tablesPort: number }) => {
  return async function auth(
    userId = 'test user id 1'
  ): Promise<AuthReturnValue> {
    process.env.ARC_TABLES_PORT = `${tablesPort}`;
    const data = await arc.tables();
    const user = await data.users.get({ id: userId });

    assert(user, `no user with id ${userId} found`);
    assert(user.secret, `no user secret for user with id ${userId} found`);

    const token = {
      accessToken: user.secret,
    };

    if (!process.env.JWT_SECRET) {
      throw new Error('Missing JWT secret');
    }
    const encodedToken: string = await encodeJWT({
      token,
      secret: process.env.JWT_SECRET,
    });

    return {
      token: encodedToken,
      user: user as User,
      secret: user.secret,
      gotFromSecProtocolHeader: false,
      link: undefined,
    };
  };
};
