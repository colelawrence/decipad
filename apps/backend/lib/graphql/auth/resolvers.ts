import assert from 'assert';
import { UserInputError, ForbiddenError } from 'apollo-server-lambda';
import NextAuthJWT, { JWTEncodeParams } from 'next-auth/jwt';
import { tokenize as tokenizeCookies } from 'simple-cookie';
import tables from '../../tables';
import jwtConf from '../../auth-flow/jwt';

const inTesting = process.env.ARC_ENV === 'testing';

export default {
  Mutation: {
    async pretendUser(_: any, { userId }: { userId: string }, context: GraphqlContext) {
      if (!inTesting) {
        throw new ForbiddenError('Forbidden');
      }

      const data = await tables();
      const user = await data.users.get({ id: userId });

      if (!user) {
        throw new UserInputError('No such user');
      }

      const options = {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      };
      assert(user.secret, 'User does not have secret');
      const token = await generateToken(user.secret, options);
      context.additionalHeaders.set(
        'Set-Cookie',
        tokenizeCookies([{ name: 'next-auth.session-token', value: token }])
      );

      return true;
    },
  },
};

async function generateToken(userSecret: string, options: Partial<JWTEncodeParams>) {
  return await NextAuthJWT.encode({
    ...jwtConf,
    token: { accessToken: userSecret },
    ...options,
  });
}
