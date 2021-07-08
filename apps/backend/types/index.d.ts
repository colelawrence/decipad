/* Basic */

type URI = string;
type ID = string;

/* Business objects */

type User = {
  id: ID;
  name: string;
  email?: string;
  image?: string;
  emailVerified?: number | Date;
  createdAt?: number | Date;
};

type UserInput = {
  name: string;
  email: string;
  image?: string;
};

type UserWithSecret = User & {
  secret: string;
  accessToken?: string;
};

type UserKey = {
  id: ID;
  user_id: string;
  validated_at?: number;
  validation_msg_sent_at?: number;
};

type Role = {
  id: ID;
  name: string;
  workspace: Workspace;
  users: User[];
};

type RoleInput = {
  name: string;
  workspaceId: ID;
};

type RoleAccess = {
  role: Role;
  permission: PermissionType;
  canComment: boolean;
};

type RoleInvitation = {
  id: ID;
  role: Role;
  user: User;
  expires_at: Date;
};

type Workspace = {
  id: ID;
  name: string;
  roles: Role[];
};

type WorkspaceInput = {
  name: string;
};

type UserAccess = {
  user: User;
  permission: PermissionType;
  canComment: boolean;
};

type PadAccess = {
  roles: RoleAccess[];
  users: UserAccess[];
};

type Pad = {
  id: ID;
  name: string;
  access?: PadAccess;
  workspace?: Workspace;
  tags?: string[];
  attachments?: Attachment[];
};

type PadInput = {
  name: string;
};

type VerificationRequest = {
  id: ID;
  identifier: string;
  token: string;
  baseUrl: string;
  expires: number;
};

type PermissionType = 'READ' | 'WRITE' | 'ADMIN';

type Changes<T> = {
  added: Array<T>;
  updated: Array<T>;
  removed: string[];
};

type Resource = {
  type: string;
  id: string;
};

type Attachment = {
  id: ID;
  fileName: string;
  fileType: string;
  uploadedByUserId: ID;
  uploadedBy?: User;
  padId: string;
  pad?: Pad;
  createdAt: number;
  fileSize: number;
};

/* Pagination */

type PageInput = {
  cursor?: string;
  maxItems: number;
};

type PagedResult<T> = {
  items: Array<T>;
  count: number;
  hasNextPage: boolean;
  cursor?: string;
};

/* Data Tables */

interface TableRecordIdentifier {
  id: ID;
}

interface TableRecord extends TableRecordIdentifier {
  createdAt?: number;
}

type TableRecordDelete<T> = {
  table: string;
  action: 'delete';
  args: TableRecordIdentifier;
  recordBeforeDelete: T;
};

type TableRecodPut<T> = {
  table: string;
  action: 'put' | 'delete';
  args: T;
};

type TableRecordChanges<T> = TableRecordPut<T> | TableRecordDelete<T>;

interface PermissionRecord extends TableRecord {
  resource_type: string;
  resource_uri: URI;
  resource_id: ID;
  user_id: ID;
  given_by_user_id: ID;
  type: PermissionType;
  role_id: ID;
  parent_resource_uri?: URI;
  parent_permission_id?: ID;
  can_comment: boolean;
}

type RoleAccess = {
  role_id: ID;
  permission: PermissionType;
  canComment: boolean;
};

type UserAccessRecord = {
  user_id: ID;
  permission: PermissionType;
  canComment: boolean;
};

type PadAccessRecord = {
  roles: RoleAccessRecord[];
  users: UserAccessRecord[];
};

interface PadRecord extends TableRecord {
  name: string;
  workspace_id: ID;
}

interface WorkspaceRecord extends TableRecord {
  name: string;
}

interface TagRecord extends TableRecordIdentifier {
  tag: string;
  resource_uri: string;
}

interface UserTaggedResourceRecord extends TableRecordIdentifier {
  user_id: ID;
  tag: string;
  workspace_id: ID;
  resource_uri: string;
}

interface UserTagRecord extends TableRecordIdentifier {
  workspace_id: ID;
  user_id: ID;
  tag: string;
}

interface RoleRecord extends TableRecord {
  name: string;
  workspace_id: ID;
  system?: boolean;
}

type SharedWithUserRecord = {
  user_id: ID;
  permissionType: PermissionType;
  canComment: boolean;
};

type SharedWithRoleRecord = {
  role_id: ID;
  permissionType: PermissionType;
  canComment: boolean;
};

type SharedWith = {
  users: SharedWithUserRecord[];
  roles: SharedWithRoleRecord[];
  pendingInvitations: ShareInvitation[];
};

interface ShareInvitation extends TableRecord {
  email: string;
}

interface InviteRecord extends TableRecord {
  permission_id: ID;
  resource_type: string;
  resource_id: string;
  resource_uri?: URI;
  user_id: ID;
  role_id: ID;
  invited_by_user_id: ID;
  permission: PermissionType;
  parent_resource_uri?: URI;
  email?: string;
  can_comment?: boolean;
  expires_at: number;
}

interface FutureFileAttachmentRecord extends TableRecord {
  user_id: ID;
  resource_uri: string;
  user_filename: string;
  filename: string;
  filetype: string;
}

interface FileAttachmentRecord extends FutureFileAttachmentRecord {
  filesize: number;
}

type SharedResource = {
  gqlType?: string;
  resource: string;
  permission: PermissionType;
  canComment: boolean;
};

interface DataTable<T> {
  delete(key: Key): Promise<void>;
  get(key: Key): Promise<T | undefined>;
  create(doc: T): Promise<void>;
  put(doc: T): Promise<void>;
  query(params: DynamoDbQuery): Promise<{
    Items: Array<T>;
    Count: number;
    LastEvaluatedKey?: string;
  }>;
  __deci_observed__?: boolean;
}

interface EnhancedDataTable<T> extends DataTable<T> {
  create(doc: T): Promise<void>;
}

interface EnhancedDataTables {
  users: EnhancedDataTable<UserWithSecret>;
  userkeys: EnhancedDataTable<UserKey>;
  permissions: EnhancedDataTable<PermissionRecord>;
  workspaces: EnhancedDataTable<WorkspaceRecord>;
  pads: EnhancedDataTable<PadRecord>;
  workspaceroles: EnhancedDataTable<RoleRecord>;
  invites: EnhancedDataTable<InviteRecord>;
  futurefileattachments: EnhancedDataTable<FutureFileAttachmentRecord>;
  fileattachments: EnhancedDataTable<FileAttachmentRecord>;
}

interface DataTables extends EnhancedDataTables {
  tags: DataTable<TagRecord>;
  usertaggedresources: DataTable<UserTaggedResourceRecord>;
  usertags: DataTable<UserTagRecord>;
  [tableName: string]: DataTable<any>;
}

interface DynamoDbQuery {
  IndexName: string;
  KeyConditionExpression: string;
  ExpressionAttributeValues: Record<string, string>;
  ExclusiveStartKey?: string;
  FilterExpression?: string;
  Limit?: number;
  Select?: 'COUNT';
}

/* Lambda */

type WSRequest = import('aws-lambda').APIGatewayProxyEventV2 & {
  requestContext: {
    connectionId: string;
  };
};

/* GraphQL */

type GraphqlContext = {
  additionalHeaders: Map<string, string>;
  user?: User;
  subscriptionId?: ID;
  connectionId?: ID;
};

/* Attachments */

interface CreateAttachmentFormResult {
  url: URI;
  fileName: string;
  fileType: string;
  fields: Record<string, string>;
}
