import type { ConcreteRecord, DataTable, User } from '@decipad/backendtypes';
import type {
  GraphqlContext,
  PermissionType,
} from '@decipad/graphqlserver-types';

export type BackendResourceDefBase<DataTableType extends ConcreteRecord> = {
  name: string;
  dataTable: () => Promise<DataTable<DataTableType>>;
  isPublic?: (record: DataTableType) => boolean | undefined;
  delegateAccessToParentResource?: boolean;
};

export type BackendResourceDefNoDelegatesToParentResource<
  DataTableType extends ConcreteRecord
> = BackendResourceDefBase<DataTableType> & {
  delegateAccessToParentResource?: false;
};

export type BackendResourceDefDelegatesToParentResource<
  DataTableType extends ConcreteRecord
> = BackendResourceDefBase<DataTableType> & {
  delegateAccessToParentResource: true;
  parentResourceUriFromRecord: (args: DataTableType) => string | undefined;
};

export type BackendResourceDef<DataTableType extends ConcreteRecord> =
  | BackendResourceDefNoDelegatesToParentResource<DataTableType>
  | BackendResourceDefDelegatesToParentResource<DataTableType>;

export interface AuthorizedResult {
  permissionType: PermissionType;
  resources: string[];
  user?: User;
}

export type BackendResource = {
  expectAuthorized: (params: {
    recordId: string;
    minimumPermissionType: PermissionType;
    user?: User;
  }) => Promise<AuthorizedResult>;
  expectAuthorizedForGraphql: (params: {
    context: GraphqlContext;
    recordId?: string;
    resourceIds?: string[];
    minimumPermissionType: PermissionType;
    ignorePadPublic?: boolean;
  }) => Promise<AuthorizedResult>;
  getResourceIds: (recordId: string) => Promise<string[]>;
};
