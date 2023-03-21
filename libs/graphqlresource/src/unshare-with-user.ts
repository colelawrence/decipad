import {
  ID,
  GraphqlContext,
  ConcreteRecord,
  GraphqlObjectType,
} from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { UserInputError } from 'apollo-server-lambda';
import { track } from '@decipad/backend-analytics';
import { expectAuthenticatedAndAuthorized, loadUser } from './authorization';
import { Resource } from '.';
import { getResources } from './utils/getResources';

export type UnshareWithUserArgs = {
  id: ID;
  userId: ID;
};

export type UnshareWithUserFunction<RecordT extends ConcreteRecord> = (
  _: unknown,
  args: UnshareWithUserArgs,
  context: GraphqlContext
) => Promise<RecordT>;

export function unshareWithUser<
  RecordT extends ConcreteRecord,
  GraphqlT extends GraphqlObjectType,
  CreateInputT,
  UpdateInputT
>(
  resourceType: Resource<RecordT, GraphqlT, CreateInputT, UpdateInputT>
): UnshareWithUserFunction<RecordT> {
  return async function unshareAndReturnUpdatedResource(
    _: unknown,
    args: UnshareWithUserArgs,
    context: GraphqlContext
  ) {
    const resources = await getResources(resourceType, args.id);
    await expectAuthenticatedAndAuthorized(resources, context, 'ADMIN');
    const { permissions } = await tables();
    await permissions.delete({
      id: `/users/${args.userId}/roles/null${resources[0]}`,
    });

    const data = await resourceType.dataTable();
    const updatedRecord = await data.get({ id: args.id });
    if (!updatedRecord) {
      throw new UserInputError(`no such ${resourceType.humanName}`);
    }

    const user = loadUser(context);

    await track(
      {
        userId: user?.id,
        event: `unshared with user`,
        properties: {
          resourceType: resourceType.humanName,
          resourceId: args.id,
        },
      },
      context
    );

    return updatedRecord;
  };
}
