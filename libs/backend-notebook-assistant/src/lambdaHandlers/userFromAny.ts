import type { User } from '@decipad/backendtypes';
import type { AuthResult } from '@decipad/services/authentication';

export const userFromAny = (authResults: AuthResult[]): User | undefined => {
  const resultWithUser = authResults.find((result) => !!result.user);
  return resultWithUser?.user;
};
