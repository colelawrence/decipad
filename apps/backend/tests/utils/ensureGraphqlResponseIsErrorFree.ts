import { FetchResult } from '@apollo/client';

export const ensureGraphqlResponseIsErrorFree = async <T extends FetchResult>(
  pResult: Promise<T>
): Promise<T> => {
  try {
    const result = await pResult;
    if (result.errors?.length) {
      throw result.errors[0];
    }
    return result;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('graphql request errored', err);
    throw err;
  }
};
