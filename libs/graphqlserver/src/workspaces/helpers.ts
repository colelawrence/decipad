import { app } from '@decipad/backend-config';
import Boom from '@hapi/boom';

interface MaybeThrowProps {
  isInternal: boolean;
  hasFreeWorkspace: boolean;
}

/**
 * A wrapper for slighly complicated logic, that can be easily confused.
 *
 * @throws Boom.fobidden
 */
export function maybeThrowForbidden({
  isInternal,
  hasFreeWorkspace,
}: MaybeThrowProps): void {
  //
  // TODO: Change this!
  //
  // We allow users to do this for now but when we release they really
  // shouldnt be able to.
  //
  if (app().environment === 'production') {
    return;
  }

  if (isInternal) {
    return;
  }

  if (!hasFreeWorkspace) {
    return;
  }

  throw Boom.forbidden(
    'User already has a free workspace. Cannot create another'
  );
}
