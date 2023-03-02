import { ID, GraphqlContext } from '@decipad/backendtypes';
import assert from 'assert';
import { encode, JWTEncodeParams } from 'next-auth/jwt';
import { tokenize as tokenizeCookies } from 'simple-cookie';
import tables from '@decipad/tables';
import { jwt as jwtConf } from '@decipad/services/authentication';
import { ForbiddenError, UserInputError } from 'apollo-server-lambda';

const inTesting = process.env.ARC_ENV === 'testing';

async function generateToken(
  userSecret: string,
  options: Partial<JWTEncodeParams>
) {
  return encode({
    ...jwtConf,
    token: { accessToken: userSecret },
    ...options,
  });
}

export default {
  Mutation: {
    async pretendUser(
      _: unknown,
      { userId }: { userId: ID },
      context: GraphqlContext
    ) {
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
