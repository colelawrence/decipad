import { ConcreteRecord, GraphqlObjectType } from '@decipad/backendtypes';
import { UserInputError } from 'apollo-server-lambda';
import { getDefined } from '@decipad/utils';
import { Resource } from '..';

export const getResources = async <
  DataTableType extends ConcreteRecord,
  GraphqlType extends GraphqlObjectType,
  CreateInputType,
  UpdateInputType
>(
  resourceType: Resource<
    DataTableType,
    GraphqlType,
    CreateInputType,
    UpdateInputType
  >,
  id: string
): Promise<[string] | [string, string]> => {
  const rootResource = `/${resourceType.resourceTypeName}/${id}`;
  const resources: [string] | [string, string] = [rootResource];
  if (resourceType.delegateAccessToParentResource) {
    const data = await resourceType.dataTable();
    const record = await data.get({ id });
    if (!record) {
      throw new UserInputError(`No such ${resourceType.humanName}`);
    }
    const parentResource = getDefined(resourceType.parentResourceUriFromRecord)(
      record
    );
    if (parentResource) {
      resources.push(parentResource);
    }
  }

  return resources;
};
