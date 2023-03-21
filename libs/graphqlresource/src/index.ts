import {
  ConcreteRecord,
  DataTable,
  GraphqlContext,
  GraphqlObjectType,
  ID,
  PermissionType,
} from '@decipad/backendtypes';
import { identity } from 'ramda';
import { access, Access } from './access';
import { create } from './create';
import { getById } from './get-by-id';
import { myPermissionType } from './my-permission-type';
import { remove } from './remove';
import { shareWithEmail, ShareWithEmailArgs } from './share-with-email';
import { shareWithRole, ShareWithRoleArgs } from './share-with-role';
import { shareWithSecret, ShareWithSecretArgs } from './share-with-secret';
import { shareWithUser, ShareWithUserArgs } from './share-with-user';
import { unshareWithRole, UnshareWithRoleArgs } from './unshare-with-role';
import {
  unshareWithSecret,
  UnshareWithSecretArgs,
} from './unshare-with-secret';
import { unshareWithUser, UnshareWithUserArgs } from './unshare-with-user';
import { update } from './update';

export { maximumPermissionType } from './maximumPermissionType';

export interface Resource<
  DataTableType extends ConcreteRecord,
  GraphqlType extends GraphqlObjectType,
  CreateInputType,
  UpdateInputType
> {
  resourceTypeName: string;
  humanName: string;
  dataTable: () => Promise<DataTable<DataTableType>>;
  isPublic?: (d: DataTableType) => boolean;
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
  skipPermissions?: boolean;
  delegateAccessToParentResource?: boolean;
}

export interface ResourceResolvers<DataT, GraphqlT, CreateT, UpdateT> {
  getById: (
    _: unknown,
    { id }: { id: ID },
    context: GraphqlContext
  ) => Promise<GraphqlT | undefined>;
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
  ) => Promise<DataT>;
  unshareWithUser: (
    _: unknown,
    args: UnshareWithUserArgs,
    context: GraphqlContext
  ) => Promise<DataT>;
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
  ) => Promise<DataT>;
  shareWithSecret: (
    _: unknown,
    args: ShareWithSecretArgs,
    context: GraphqlContext
  ) => Promise<string>;
  unshareWithSecret: (
    _: unknown,
    args: UnshareWithSecretArgs,
    context: GraphqlContext
  ) => Promise<boolean>;
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
  toGraphql: (d: DataT) => GraphqlT;
}

export default function createGraphqlResource<
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
    unshareWithSecret: unshareWithSecret(resourceType),
    toGraphql: resourceType.toGraphql ?? identity,
  };
}
