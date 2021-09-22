import {
  ID,
  DataTable,
  ConcreteRecord,
  GraphqlObjectType,
  GraphqlContext,
  PermissionType,
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
import { access } from './access';
import { ShareWithUserArgs } from './share-with-user';
import { UnshareWithUserArgs } from './unshare-with-user';
import { ShareWithRoleArgs } from './share-with-role';
import { UnshareWithRoleArgs } from './unshare-with-role';
import { ShareWithEmailArgs } from './share-with-email';
import { Access } from './access';
import { shareWithSecret, ShareWithSecretArgs } from './share-with-secret';
import { myPermissionType } from './my-permission-type';

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

export interface ResourceResolvers<DataT, GraphqlT, CreateT, UpdateT> {
  getById: (
    _: unknown,
    { id }: { id: ID },
    context: GraphqlContext
  ) => Promise<GraphqlT>;
  create: (
    _: unknown,
    create: CreateT,
    context: GraphqlContext
  ) => Promise<GraphqlT>;
  update: (
    _: unknown,
    update: { id: ID } & UpdateT,
    context: GraphqlContext
  ) => Promise<GraphqlT>;
  remove: (
    _: unknown,
    { id }: { id: ID },
    context: GraphqlContext
  ) => Promise<void>;
  shareWithUser: (
    _: unknown,
    args: ShareWithUserArgs,
    context: GraphqlContext
  ) => Promise<void>;
  unshareWithUser: (
    _: unknown,
    args: UnshareWithUserArgs,
    context: GraphqlContext
  ) => Promise<void>;
  shareWithRole: (
    _: unknown,
    args: ShareWithRoleArgs,
    context: GraphqlContext
  ) => Promise<void>;
  unshareWithRole: (
    _: unknown,
    args: UnshareWithRoleArgs,
    context: GraphqlContext
  ) => Promise<void>;
  shareWithEmail: (
    _: unknown,
    args: ShareWithEmailArgs,
    context: GraphqlContext
  ) => Promise<void>;
  shareWithSecret: (
    _: unknown,
    args: ShareWithSecretArgs,
    context: GraphqlContext
  ) => Promise<string>;
  access: (
    parent: DataT,
    _: unknown,
    context: GraphqlContext
  ) => Promise<Access>;
  myPermissionType: (
    parent: DataT,
    _: unknown,
    context: GraphqlContext
  ) => Promise<PermissionType | undefined>;
}

export default function <
  DataTableT extends ConcreteRecord,
  GraphqlT extends GraphqlObjectType,
  CreateInputT,
  UpdateInputT
>(
  resourceType: Resource<DataTableT, GraphqlT, CreateInputT, UpdateInputT>
): ResourceResolvers<DataTableT, GraphqlT, CreateInputT, UpdateInputT> {
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
    shareWithSecret: shareWithSecret(resourceType),
    access: access(resourceType),
    myPermissionType: myPermissionType(resourceType),
  };
}
