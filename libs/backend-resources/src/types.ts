import type { ConcreteRecord, DataTable, User } from '@decipad/backendtypes';
import type {
  GraphqlContext,
  PermissionType,
} from '@decipad/graphqlserver-types';

export type BackendResourceDef<DataTableType extends ConcreteRecord> = {
  name: string;
  delegateAccessToParentResource?: boolean;
  parentResourceUriFromRecord?: (args: DataTableType) => string | undefined;
  dataTable: () => Promise<DataTable<DataTableType>>;
  isPublic?: (record: DataTableType) => boolean | undefined;
};

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
