/* Basic */

type URI = string;
type ID = string;

/* Business objects */

type User = {
  id: ID
  name: string
  email: string
  image?: string
  emailVerified?: number | Date
};

type UserInput = {
  name: string
  email: string
  image?: string
};

type UserWithSecret = User & {
  secret: string
  accessToken?: string
};

type UserKey = {
  id: ID
  user_id: string
  validated_at?: number
  validation_msg_sent_at?: number
};

type Role = {
  id: ID
  name: string
  workspace: Workspace
  users: User[]
};

type RoleInput = {
  name: string
  workspaceId: ID
};

type RoleAccess = {
  role: Role
  permission: PermissionType
  canComment: boolean
};

type RoleInvitation = {
  id: ID
  role: Role
  user: User
  expires_at: Date
};

type Workspace = {
  id: ID
  name: string
  roles: Role[]
};

type WorkspaceInput = {
  name: string
};

type UserAccess = {
  user: User
  permission: PermissionType
  canComment: boolean
};

type PadAccess = {
  roles: RoleAccess[]
  users: UserAccess[]
};

type Pad = {
  id: ID
  name: string
  access?: PadAccess
  workspace?: Workspace
};

type PadInput = {
  name: string
}

type VerificationRequest = {
  id: ID
  identifier: string
  token: string
  baseUrl: string
  expires: number
};

type PermissionType = 'READ' | 'WRITE' | 'ADMIN';

type Changes<T> = {
  added: Array<T>
  updated: Array<T>
  removed: string[]
};

type Resource = {
  type: string
  id: string
};

/* Pagination */

type PageInput = {
  cursor?: string
  maxItems: number
};

type PagedResult<T> = {
  items: Array<T>
  count: number
  hasNextPage: boolean
  cursor?: string
};


/* Data Tables */

type TableRecordIdentifier = {
  id: string
};

type TableRecordDelete = {
  table: string
  action: 'delete'
  args: TableRecordIdentifier
};

type TableRecodPut<T> = {
  table: string
  action: 'put' | 'delete'
  args: T
};

type TableRecordChanges<T> = TableRecordPut<T> | 1;

type PermissionRecord = {
  id: ID
  resource_type: string
  resource_uri: URI
  resource_id: ID
  user_id: ID
  given_by_user_id: ID
  type: PermissionType
  role_id: ID
  parent_resource_uri: URI
  parent_permission_id: ID
  can_comment: boolean
  created_at: number
};

type RoleAccess = {
  role_id: ID
  permission: PermissionType
  canComment: boolean
};

type UserAccessRecord = {
  user_id: ID
  permission: PermissionType
  canComment: boolean
};

type PadAccessRecord = {
  roles: RoleAccessRecord[]
  users: UserAccessRecord[]
}

type PadRecord = {
  id: ID
  name: string
  workspace_id: ID
};

type RoleRecord = {
  id: ID
  name: string
  workspace_id: ID
  system?: boolean
};

type SharedWithUserRecord = {
  user_id: ID
  permissionType: PermissionType
  canComment: boolean
};

type SharedWithRoleRecord = {
  role_id: ID
  permissionType: PermissionType
  canComment: boolean
};

type SharedWith = {
  users: SharedWithUserRecord[]
  roles: SharedWithRoleRecord[]
  pendingInvitations: ShareInvitation[]
};

type ShareInvitation = {
  email: string
};

type SharedResource = {
  gqlType?: string,
  resource: string
  permission: PermissionType
  canComment: boolean
};

interface DataTable<T> {
  delete(key: Key): Promise<void>
  get(key: Key): Promise<T>
  put(key: Key): Promise<void>
  query(params: DynamoDbQuery): Promise<{
    Items: Array<T>
    LastEvaluatedKey?: string
  }>
  __deci_observed__?: boolean
};

type DataTables = {
  users: DataTable<UserWithSecret>
  pads: DataTable<PadRecord>
  permissions: DataTable<PermissionRecord>
  workspaceroles: DataTable<RoleRecord>
  [tableName: string]: DataTable<any>
};

interface DynamoDbQuery {
  IndexName: string
  KeyConditionExpression: string
  ExpressionAttributeValues: Record<string, string>
  ExclusiveStartKey?: string
  FilterExpression?: string
  Limit?: number
};

/* Lambda */

type WSRequest = import('aws-lambda').APIGatewayProxyEventV2 & {
  requestContext: {
    connectionId: string
  }
};

/* GraphQL */

type GraphqlContext = {
  additionalHeaders: Map<string, string>
  user?: User
  subscriptionId?: ID
  connectionId?: ID
}
