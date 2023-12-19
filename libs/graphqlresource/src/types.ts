import {
  ConcreteRecord,
  DataTable,
  GraphqlObjectType,
} from '@decipad/backendtypes';
import {
  GraphqlContext,
  ID,
  PermissionType,
  ResourceAccess,
  ShareWithEmailInput,
  ShareWithRoleInput,
  ShareWithSecretInput,
  ShareWithUserInput,
  UnshareWithRoleInput,
  UnshareWithUserInput,
} from '@decipad/graphqlserver-types';

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
  ) => Promise<boolean>;
  shareWithUser: (
    _: unknown,
    args: ShareWithUserInput,
    context: GraphqlContext
  ) => Promise<GraphqlT>;
  unshareWithUser: (
    _: unknown,
    args: UnshareWithUserInput,
    context: GraphqlContext
  ) => Promise<GraphqlT>;
  shareWithRole: (
    _: unknown,
    args: ShareWithRoleInput,
    context: GraphqlContext
  ) => Promise<boolean>;
  unshareWithRole: (
    _: unknown,
    args: UnshareWithRoleInput,
    context: GraphqlContext
  ) => Promise<boolean>;
  shareWithEmail: (
    _: unknown,
    args: ShareWithEmailInput,
    context: GraphqlContext
  ) => Promise<GraphqlT>;
  shareWithSecret: (
    _: unknown,
    args: ShareWithSecretInput,
    context: GraphqlContext
  ) => Promise<string>;
  unshareWithSecret: (
    _: unknown,
    args: ShareWithSecretInput,
    context: GraphqlContext
  ) => Promise<boolean>;
  access: (
    parent: GraphqlT,
    _: unknown,
    context: GraphqlContext
  ) => Promise<ResourceAccess>;
  myPermissionType: (
    parent: GraphqlT,
    _: unknown,
    context: GraphqlContext
  ) => Promise<PermissionType | undefined>;
  toGraphql: (d: DataT) => GraphqlT;
}

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
  parentResourceUriFromCreateInput?: (
    args: CreateInputType
  ) => string | undefined;
  parentResourceUriFromRecord?: (args: DataTableType) => string | undefined;
  pubSubChangeTopic?: string;
  skipPermissions?: boolean;
  delegateAccessToParentResource?: boolean;
}

// export type HelperType<
//   A extends keyof  ResourceResolvers,
//   DataTableType extends ConcreteRecord,
//   GraphqlType extends GraphqlObjectType,
//   CreateInputType,
//   UpdateInputType
// > = (resourceType: Resource<DataTableType, GraphqlType, CreateInput>)
