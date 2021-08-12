import {
  DataTable,
  ConcreteRecord,
  GraphqlObjectType,
  GraphqlContext,
} from '@decipad/backendtypes';
import { getById } from './get-by-id';
import { create } from './create';
import { update } from './update';
import { remove } from './remove';
import { shareWithUser } from './share-with-user';
import { unshareWithUser } from './unshare-with-user';
import { shareWithRole } from './share-with-role';
import { unshareWithRole } from './unshare-with-role';
import { shareWithEmail } from './share-with-email';

export interface Resource<
  DataTableType extends ConcreteRecord,
  GraphqlType extends GraphqlObjectType,
  CreateInputType,
  UpdateInputType
> {
  resourceTypeName: string;
  humanName: string;
  dataTable: () => Promise<DataTable<DataTableType>>;
  toGraphql: (d: DataTableType) => GraphqlType;
  newRecordFrom: (d: CreateInputType) => DataTableType;
  updateRecordFrom: (
    old: DataTableType,
    input: UpdateInputType
  ) => DataTableType;
  beforeCreate?: (
    args: CreateInputType,
    context: GraphqlContext
  ) => Promise<void>;
  parentResourceUriFromCreateInput?: (args: CreateInputType) => string;
  parentResourceUriFromRecord?: (args: DataTableType) => string;
  pubSubChangeTopic?: string;
}

export default function <
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
  >
) {
  const shareWithUserFn = shareWithUser(resourceType);
  return {
    getById: getById(resourceType),
    create: create(resourceType),
    update: update(resourceType),
    remove: remove(resourceType),
    shareWithUser: shareWithUserFn,
    unshareWithUser: unshareWithUser(resourceType),
    shareWithRole: shareWithRole(resourceType),
    unshareWithRole: unshareWithRole(resourceType),
    shareWithEmail: shareWithEmail(resourceType)(shareWithUserFn),
  };
}
