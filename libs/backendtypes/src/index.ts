import { APIGatewayProxyEventV2 } from 'aws-lambda';

/* Basic */

export type URI = string;
export type ID = string;

/* Business objects */

export type User = {
  id: ID;
  name: string;
  email?: string;
  image?: string;
  createdAt?: number | Date;
};

export interface UserInput {
  name: string;
  email?: string;
  image?: string;
  provider?: string;
  providerId?: string;
}

export interface GithubUser extends UserInput {
  provider: 'github';
  id: number | string;
  login?: string;
  avatar_url?: string;
}

export type UserWithSecret = User & {
  secret: string;
  accessToken?: string;
};

export type Role = {
  id: ID;
  name: string;
  workspace: Workspace;
  users: User[];
};

export type RoleInput = {
  name: string;
  workspaceId: ID;
};

export type RoleInvitation = {
  id: ID;
  role: Role;
  user: User;
  expires_at: Date | number;
};

export type Workspace = {
  id: ID;
  name: string;
  roles: Role[];
};

export type WorkspaceInput = {
  name: string;
};

export type UserAccess = {
  user: User;
  permission: PermissionType;
  canComment: boolean;
};

export type RoleAccess = {
  role_id: ID;
  permission: PermissionType;
  canComment: boolean;
};

export type SecretAccess = {
  secret: string;
  permission: PermissionType;
  canComment: boolean;
};

export type PadAccess = {
  roles: RoleAccess[];
  users: UserAccess[];
  secrets: SecretAccess[];
};

export type Pad = {
  id: ID;
  name: string;
  access?: PadAccess;
  workspace?: Workspace;
  tags?: string[];
  attachments?: Attachment[];
};

export type PadInput = {
  name: string;
};

export type VerificationRequest = {
  id: ID;
  identifier: string;
  token: string;
  baseUrl: string;
  expires: number;
};

export type PermissionType = 'READ' | 'WRITE' | 'ADMIN';

export type Changes<T extends TableRecord> = {
  added?: Array<T>;
  updated?: Array<T>;
  removed?: Array<string | T>;
};

export type Resource = {
  type: string;
  id: string;
  idParts?: string[];
};

export type Attachment = {
  id: ID;
  fileName: string;
  fileType: string;
  uploadedByUserId: ID;
  uploadedBy?: User;
  padId: string;
  pad?: Pad;
  url?: string;
  createdAt?: number;
  fileSize: number;
};

export type Tag = {
  tag: string;
  workspaceId: ID;
};

export type VirtualRecord = Tag; // other virtual record types here

export interface ExternalDataSourceUpdateInput {
  name: string;
}

export interface ExternalDataSourceCreateInput
  extends ExternalDataSourceUpdateInput {
  id: ID;
  padId: ID;
  provider: ExternalDataSourceProvider;
  externalId: string;
}

export interface ExternalDataSource extends ExternalDataSourceCreateInput {
  dataUrl: string;
  authUrl: string;
}

type ExternalDataSourceProvider = 'testdatasource' | 'googlesheets' | 'other';

/* Pagination */

export type PageInput = {
  cursor?: string;
  maxItems: number;
};

export type PagedResult<T> = {
  items: Array<T>;
  count: number;
  hasNextPage: boolean;
  cursor?: string;
};

/* Data Tables */

export interface TableRecordIdentifier {
  id: ID;
}

export interface TableRecordBase extends TableRecordIdentifier {
  createdAt?: number;
}

type TableRecordDelete<T extends TableRecord> = {
  table: string;
  action: 'delete';
  args: TableRecordIdentifier;
  recordBeforeDelete: T;
};

type TableRecordPut<T extends TableRecord> = {
  table: string;
  action: 'put';
  args: T;
};

export type TableRecordChanges<T extends TableRecord> =
  | TableRecordPut<T>
  | TableRecordDelete<T>;

export interface UserRecord extends TableRecordBase {
  name: string;
  last_login?: number;
  image?: string;
  email?: string;
  secret: string;
}

export interface UserKeyRecord extends TableRecordBase {
  user_id: ID;
  validated_at?: number;
  validation_msg_sent_at?: number;
}

interface UserKeyValidationRecord extends TableRecordBase {
  userkey_id: ID;
  expires_at: number;
}

export interface PermissionRecord extends TableRecordBase {
  resource_type: string;
  resource_uri: URI;
  resource_id: ID;
  user_id: ID;
  given_by_user_id: ID;
  type: PermissionType;
  role_id: ID;
  secret?: string;
  parent_resource_uri?: URI;
  parent_permission_id?: ID;
  can_comment: boolean;
}

type UserAccessRecord = {
  user_id: ID;
  permission: PermissionType;
  canComment: boolean;
};

type RoleAccessRecord = {
  role_id: ID;
  permission: PermissionType;
  canComment: boolean;
};

type SecretAccessRecord = {
  secret: string;
  permission: PermissionType;
  canComment: boolean;
};

export type PadAccessRecord = {
  roles: RoleAccessRecord[];
  users: UserAccessRecord[];
  secrets: SecretAccessRecord[];
};

export interface PadRecord extends TableRecordBase {
  name: string;
  workspace_id: ID;
}

export interface WorkspaceRecord extends TableRecordBase {
  name: string;
}

export interface TagRecord extends TableRecordBase {
  tag: string;
  resource_uri: string;
}

export interface UserTaggedResourceRecord extends TableRecordBase {
  user_id: ID;
  tag: string;
  workspace_id: ID;
  resource_uri: string;
}

export interface UserTagRecord extends TableRecordBase {
  workspace_id: ID;
  user_id: ID;
  tag: string;
}

export interface RoleRecord extends TableRecordBase {
  name: string;
  workspace_id: ID;
  system?: boolean;
}

export type SharedWithUserRecord = {
  user_id: ID;
  permissionType: PermissionType;
  canComment: boolean;
};

export type SharedWithRoleRecord = {
  role_id: ID;
  permissionType: PermissionType;
  canComment: boolean;
};

export type SharedWith = {
  users: SharedWithUserRecord[];
  roles: SharedWithRoleRecord[];
  pendingInvitations: ShareInvitation[];
};

interface ShareInvitation extends TableRecordBase {
  email: string;
}

interface InviteRecord extends TableRecordBase {
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

interface FutureFileAttachmentRecord extends TableRecordBase {
  user_id: ID;
  resource_uri: string;
  user_filename: string;
  filename: string;
  filetype: string;
}

export interface FileAttachmentRecord extends FutureFileAttachmentRecord {
  filesize: number;
}

export interface VerificationRequestRecord extends TableRecordBase {
  identifier: string;
  token: string;
  expires: number;
}

interface SubscriptionRecord extends TableRecordBase {
  connection_id: string;
  user_id: ID;
  gqltype: string;
  filter?: string;
}

interface CollabRecord extends TableRecordBase {
  user_id?: ID;
  room: string;
  conn: string;
}

interface ConnectionRecord extends TableRecordBase {
  user_id?: ID;
  room?: string;
  secret?: string;
  gqlstate?: string;
}

export interface ExternalDataSourceRecord extends TableRecordBase {
  name: string;
  padId: ID;
  provider: ExternalDataSourceProvider;
  externalId: string;
}

export interface ExternalKeyRecord extends TableRecordBase {
  resource_uri: string;
  access_token: string;
  refresh_token: string;
  token_type?: string;
  scope?: string;
  lastError?: string;
  createdAt: number;
  expiresAt: number;
  lastUsedAt?: number;
}

export interface DataTable<T extends TableRecordBase> {
  delete(
    key: TableRecordIdentifier | (TableRecordIdentifier & { seq: string }),
    noEvents?: boolean
  ): Promise<void>;
  get(key: Record<string, string>): Promise<T | undefined>;
  create(doc: T, noEvents?: boolean): Promise<void>;
  put(doc: T, noEvents?: boolean): Promise<void>;
  query(params: DynamoDbQuery): Promise<{
    Items: Array<T>;
    Count: number;
    LastEvaluatedKey?: string;
  }>;
  __deci_observed__?: boolean;
}

interface EnhancedDataTable<T extends TableRecordBase> extends DataTable<T> {
  create(doc: T): Promise<void>;
}

export interface EnhancedDataTables {
  users: EnhancedDataTable<UserRecord>;
  userkeys: EnhancedDataTable<UserKeyRecord>;
  permissions: EnhancedDataTable<PermissionRecord>;
  workspaces: EnhancedDataTable<WorkspaceRecord>;
  pads: EnhancedDataTable<PadRecord>;
  workspaceroles: EnhancedDataTable<RoleRecord>;
  invites: EnhancedDataTable<InviteRecord>;
  futurefileattachments: EnhancedDataTable<FutureFileAttachmentRecord>;
  fileattachments: EnhancedDataTable<FileAttachmentRecord>;
  externaldatasources: DataTable<ExternalDataSourceRecord>;
  externaldatasourcekeys: DataTable<ExternalKeyRecord>;
}

export interface DataTables extends EnhancedDataTables {
  tags: DataTable<TagRecord>;
  usertaggedresources: DataTable<UserTaggedResourceRecord>;
  usertags: DataTable<UserTagRecord>;
  verificationrequests: DataTable<VerificationRequestRecord>;
  subscriptions: DataTable<SubscriptionRecord>;
  userkeyvalidations: DataTable<UserKeyValidationRecord>;
  collabs: DataTable<CollabRecord>;
  connections: DataTable<ConnectionRecord>;
  docsync: VersionedDataTable<DocSyncRecord>;
  docsyncupdates: DataTable<DocSyncUpdateRecord>;
}

export type ConcreteRecord =
  | ConnectionRecord
  | UserRecord
  | UserKeyRecord
  | PermissionRecord
  | WorkspaceRecord
  | PadRecord
  | RoleRecord
  | InviteRecord
  | FutureFileAttachmentRecord
  | FutureFileAttachmentRecord
  | TagRecord
  | UserTaggedResourceRecord
  | UserTagRecord
  | VerificationRequestRecord
  | SubscriptionRecord
  | DocSyncRecord
  | DocSyncUpdateRecord;

export type TableRecord = VirtualRecord | ConcreteRecord;

export type ConcreteDataTable = DataTable<ConcreteRecord>;

/* DynamoDB */

export interface DynamoDbQuery {
  IndexName?: string;
  KeyConditionExpression: string;
  ExpressionAttributeValues: Record<string, string>;
  ExpressionAttributeNames?: Record<string, string>;
  ExclusiveStartKey?: string;
  FilterExpression?: string;
  Limit?: number;
  Select?: 'COUNT';
}

/* Versioned table records */

export interface VersionedTableRecord extends TableRecordBase {
  _version: number;
}

export interface DocSyncRecord extends VersionedTableRecord {
  data?: string;
  seq?: number[];
}

export interface DocSyncUpdateRecord extends TableRecordBase {
  seq: string;
  data: string;
}

export type VersionedDataTable<T extends VersionedTableRecord> =
  DataTable<T> & {
    withLock: (
      id: string,
      fn: (record: T | undefined) => Promise<T>
    ) => Promise<T>;
  };

export interface VersionedDataTables {
  docsync: VersionedDataTable<DocSyncRecord>;
}

/* Lambda */

export type WSRequest = import('aws-lambda').APIGatewayProxyEventV2 & {
  requestContext: {
    connectionId: string;
  };
};

/* GraphQL */

export type GraphqlContext = {
  additionalHeaders: Map<string, string>;
  user?: User;
  subscriptionId?: ID;
  connectionId?: ID;
  event: APIGatewayProxyEventV2;
};

export type GraphqlObjectType = TableRecord | ExternalDataSource; // add others here

/* Shared resources */

export type SharedResource = {
  gqlType?: string;
  resource: string;
  permission: PermissionType;
  canComment: boolean;
};

/* Attachments */

export interface CreateAttachmentFormResult {
  url: URI;
  fileName: string;
  fileType: string;
  fields: Record<string, string>;
}
