import type { PromiseOrType } from '@decipad/utils';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import type { OBSERVED } from './constants';
import type { SubscriptionPlansNames } from '@decipad/graphqlserver-types';
import type { ArcTable } from '@architect/functions/types/tables';
import type { DynamoDB } from 'aws-sdk';

/* Basic */

export type URI = string;
export type ID = string;

/* Business objects */

export type User = {
  id: ID;
  name: string;
  description?: string;
  email?: string | null;
  image?: string | null;
  createdAt?: number | Date;
  last_login?: number;
  first_login?: number;
  hideChecklist?: boolean;
  onboarded?: boolean;
  banned?: number;
};

export type AnonUser = {
  id: ID;
  createdAt: number;
  name: string;
  image?: string | null;
  last_login?: number;
  first_login?: number;
};

export interface UserInput {
  name: string;
  description?: string;
  email?: string | null;
  image?: string | null;
  provider?: string;
  providerId?: string;
  previous_login?: number;
  last_login?: number;
  first_login?: number;
  hideChecklist?: boolean;
  onboarded?: boolean;
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

export type AnonUserWithSecret = AnonUser & {
  secret: string;
  accessToken?: string; // N.B. not sure this is necessary
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
  isPublic?: boolean;
  isPremium?: boolean;
  roles: Role[];
};

export type WorkspaceInput = {
  name: string;
  isPublic?: boolean;
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
  id: ID;
  roles: RoleAccess[];
  users: UserAccess[];
  secrets: SecretAccess[];
};

export type Pad = {
  id: ID;
  name: string;
  access?: PadAccess;
  workspace?: Workspace;
  icon?: string;
  tags?: string[];
  attachments?: Attachment[];
  banned?: number;
};

export type Section = {
  id: ID;
  name: string;
  color: string;
  workspace_id: ID;
};

export type PadSnapshot = {
  id: ID;
  snapshotName: string;
  createdAt?: number | Date;
  updatedAt?: number | Date;
  data?: string;
  version?: string;
};

export type PadInput = {
  name: string;
  icon?: string;
  status?: string;
  section_id?: string;
  archived?: boolean;
  isTemplate?: number;
  isPublic?: boolean;
  gist?: PadRecord['gist'];
};

export type SectionInput = {
  name: string;
  color: string;
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
  padId?: ID;
  workspace_id?: ID;
  provider: ExternalDataSourceProvider;
  externalId: string;
  dataSourceName?: string;
}

// TODO: This is an old graphql type we don't need anymore!
export interface ExternalDataSource extends ExternalDataSourceCreateInput {
  dataUrl: string;
  authUrl: string;
}

export type ExternalDataSourceProvider =
  | 'decipad'
  | 'gsheets'
  | 'notion'
  | 'csv'
  | 'json'
  | 'postgresql'
  | 'mysql'
  | 'mssql'
  | 'oracledb'
  | 'cockroachdb'
  | 'redshift'
  | 'mariadb'
  | 'bigquery';

/* Pricing */
export interface CreditsPricePlan {
  id: ID;
  name?: string;
  description?: string;
  price: number;
  credits: number;
  isDefault?: boolean;
  promotionTag?: string;
  currency: string;
}

export interface CreditsPlan {
  id: ID;
  title?: string;
  description?: string;
  plans: CreditsPricePlan[];
}

export interface SubscriptionPlan {
  paymentLink?: string;
  credits?: number;
  queries?: number;
  seats?: number;
  description?: string;
  price?: number;
  currency?: string;
  title: string;
  id: string;
  key: string;
  isDefault?: boolean;
  storage?: number;
}

export interface CheckoutSessionInfo {
  id: string;
  clientSecret: string;
}

/* Pagination */

export type PageInput = {
  cursor?: string | null;
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

export type TableRecordChanges<T extends TableRecord> = (
  | TableRecordPut<T>
  | TableRecordDelete<T>
) & {
  user_id?: string;
};

export interface UserRecord extends TableRecordBase {
  name: string;
  last_login?: number;
  previous_login?: number;
  // image hash
  image?: string | null;
  email?: string | null;
  secret?: string;
  first_login?: number;
  hideChecklist?: boolean;
  completeChecklist?: boolean;
  onboarded?: boolean;
  description?: string;
  id: string;
  banned?: number;
  bannedReason?: string;
  bannedBy?: string;
  bannedWhen?: number | Date;
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
  workspace_id?: ID;

  isPublic?: boolean;

  userConsentToFeatureOnGallery?: boolean;

  icon?: string;
  createdAt: number;
  section_id?: string;
  archived?: boolean;
  isTemplate?: number;

  gist?: 'ai';

  // Pad specific permissions

  // Can a user with no read/write duplicate the notebook.
  canPublicDuplicate?: boolean;

  banned?: number;
  bannedReason?: string;
  bannedBy?: string;
  bannedWhen?: number | Date;
}

export interface SectionRecord extends TableRecordBase {
  name: string;
  color: string;
  workspace_id: ID;
  createdAt: number;
}

export interface WorkspaceRecord extends TableRecordBase {
  name: string;
  isPublic?: boolean;
  isPremium?: boolean;
  plan?: SubscriptionPlansNames;
}

export interface WorkspaceNumberRecord extends TableRecordBase {
  name: string;
  workspace_id: ID;

  /** Base64 encoded */
  encoding: string;
  origin: string;
}

export interface TagRecord extends TableRecordBase {
  tag: string;
  resource_uri: string;
}

export interface UserTaggedResourceRecord extends TableRecordBase {
  user_id: ID;
  tag: string;
  workspace_id?: ID;
  resource_uri: string;
}
export interface UserTagRecord extends TableRecordBase {
  workspace_id: ID;
  user_id: ID;
  tag: string;
}

export interface UserBackup extends TableRecordBase {
  pad_id: string;
  user_id: string;
  file_name: string;
  datetime: string;
  session_token: string;
  user_agent: string;
  expires_at: number;
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
  // When are we going to delete this attachment?
  toBeDeleted?: number;
}

export interface VerificationRequestRecord extends TableRecordBase {
  identifier: string;
  token: string;
  expires: number;
  resourceLink?: string;
  openTokenForTestsOnly?: string;
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

export interface ConnectionRecord extends TableRecordBase {
  user_id?: ID;
  client_id?: number;
  room?: string;
  secret?: string;
  authorizationType?: string;
  gqlstate?: string;
  versionName?: string;
  protocol?: number | string;
  expiresAt?: number;
}

export interface ExternalDataSourceRecord extends TableRecordBase {
  name: string;
  padId?: ID;
  workspace_id?: ID;
  provider: ExternalDataSourceProvider;
  externalId: string;
  dataSourceName?: string;
  expiresAt?: number;
}

export interface ExternalDataSourceSnapshotRecord extends TableRecordBase {
  //
  // We need both an external_data_id and external_data_url, because a single
  // external_data can have multiple URL it points to, and hence we want to
  // capture snapshots from various sources.
  //
  // For example, google sheets needs metadata before making a request, which
  // is a different URL
  //

  external_data_id: string;
  external_data_url: string;

  //
  // A data snapshot could be tagged with a published_snapshot_id,
  // which means it's tied to a certain published version.
  //
  published_snapshot_id?: string;

  // URI of the S3 bucket the actual data is stored in.
  resource_uri: string;
}

export interface SecretRecord extends TableRecordBase {
  name: string;
  workspace_id: ID;
  secret: string;
}
export interface WorkspaceSubscriptionRecord extends TableRecordBase {
  workspace_id: ID;
  clientReferenceId: string;
  paymentLink?: string;
  paymentStatus: string;
  email: string;
  credits?: number;
  queries?: number;
  storage?: number;
  seats?: number;
  editors?: number;
  readers?: number;
}

export interface SecretInput {
  name: string;
  secret: string;
}

export interface GoalFulfilmentInput {
  goalName: string;
}

export interface SetUsernameInput {
  username: string;
}

export interface ExternalKeyRecord extends TableRecordBase {
  resource_uri: string;
  access_token: string;
  createdBy: ID;
  provider: ExternalDataSourceProvider;
  createdAt: number;

  /**
   * Some OAuth providers don't issue refresh_tokens
   * Because the access_token never expires
   */
  refresh_token?: string;

  /**
   * Optional, because some access_tokens don't expire
   * This is also a TTL record, so be careful.
   */
  expiresAt?: number;

  token_type?: string;
  scope?: string;
  lastError?: string;
  lastUsedAt?: number;
}

export interface AnnotationRecord extends TableRecordBase {
  content: string;
  type: string;
  pad_id: string;
  alias_id?: string;
  alias?: AliasRecord;
  user_id?: string;
  meta?: string;
  block_id: string;
  scenario_id?: string;
  dateCreated: number;
  dateUpdated?: number;
}

export interface AliasRecord extends TableRecordBase {
  id: string;
  alias: string;
  pad_id: string;
  annotations?: AnnotationRecord[];
  events?: PadEventRecord[];
}

export interface PadEventRecord extends TableRecordBase {
  id: string;
  pad_id: string;
  alias_id: string;
  name: string;
  meta: string;
  created_at: number;
}

export interface ScenarioRecord extends TableRecordBase {
  pad_id: string;
  scenario_name?: string;
  user_id: string;
}

export interface LogRecord extends TableRecordBase {
  resource: string;
  seq: string;
  user_id: string;
  source: string;
  content: string;
  expiresAt: number;
}

type UpdateParams<T> = Parameters<ArcTable<T>['update']>[0];
type UpdateOutput = DynamoDB.DocumentClient.UpdateItemOutput;

export interface DataTable<T extends TableRecordBase> {
  delete(
    key: TableRecordIdentifier | (TableRecordIdentifier & { seq: string }),
    noEvents?: boolean
  ): Promise<void>;
  get(key: Record<string, string>): Promise<T | undefined>;
  create(doc: T, noEvents?: boolean): Promise<void>;

  /**
   * Puts thew whole document (either creating or updating it).
   * - eventProbability: if a number, the probability of itr creating an event into the queue,
   *   to be handled by a `<tablename>-changes` lambda in libs/lambdas/src/queues
   */
  put(doc: T, eventProbability?: boolean | number): Promise<void>;
  query(params: DynamoDbQuery): Promise<{
    Items: Array<T>;
    Count: number;
    LastEvaluatedKey?: string;
  }>;
  scan(params?: DynamoDbQuery): Promise<{
    Items: Array<T>;
    Count: number;
    LastEvaluatedKey?: string;
  }>;
  update(params: UpdateParams<T>): Promise<UpdateOutput>;
  [OBSERVED]?: boolean;
}

export interface EnhancedDataTable<T extends TableRecordBase>
  extends DataTable<T> {
  create(doc: T): Promise<void>;
  batchGet(ids: string[]): Promise<T[]>;
  batchDelete(selectors: Array<{ id: string; seq?: string }>): Promise<void>;
}

export interface EnhancedDataTables {
  docsyncupdates: EnhancedDataTable<DocSyncUpdateRecord>;
  users: EnhancedDataTable<UserRecord>;
  anonusers: EnhancedDataTable<AnonUser>;
  userkeys: EnhancedDataTable<UserKeyRecord>;
  userbackups: DataTable<UserBackup>;
  permissions: EnhancedDataTable<PermissionRecord>;
  workspaces: EnhancedDataTable<WorkspaceRecord>;
  workspacenumbers: EnhancedDataTable<WorkspaceNumberRecord>;
  pads: EnhancedDataTable<PadRecord>;
  sections: EnhancedDataTable<SectionRecord>;
  workspaceroles: EnhancedDataTable<RoleRecord>;
  invites: EnhancedDataTable<InviteRecord>;
  futurefileattachments: EnhancedDataTable<FutureFileAttachmentRecord>;
  fileattachments: EnhancedDataTable<FileAttachmentRecord>;
  externaldatasources: DataTable<ExternalDataSourceRecord>;
  externaldatasourcekeys: DataTable<ExternalKeyRecord>;
  externaldatasnapshots: DataTable<ExternalDataSourceSnapshotRecord>;
  secrets: EnhancedDataTable<SecretRecord>;
  workspacesubscriptions: EnhancedDataTable<WorkspaceSubscriptionRecord>;
  resourceusages: EnhancedDataTable<ResourceUsageRecord>;
  annotations: EnhancedDataTable<AnnotationRecord>;
  scenarios: EnhancedDataTable<ScenarioRecord>;
  resourceusagehistory: EnhancedDataTable<ResourceUsageHistoryRecord>;
  aliases: EnhancedDataTable<AliasRecord>;
  padevents: EnhancedDataTable<PadEventRecord>;
}

export interface DataTables extends EnhancedDataTables {
  _doc: DynamoDBDocument;
  tags: DataTable<TagRecord>;
  usertaggedresources: DataTable<UserTaggedResourceRecord>;
  usertags: DataTable<UserTagRecord>;
  verificationrequests: DataTable<VerificationRequestRecord>;
  subscriptions: DataTable<SubscriptionRecord>;
  userkeyvalidations: DataTable<UserKeyValidationRecord>;
  collabs: DataTable<CollabRecord>;
  connections: DataTable<ConnectionRecord>;
  docsync: VersionedDataTable<DocSyncRecord>;
  docsyncsnapshots: DataTable<DocSyncSnapshotRecord>;
  allowlist: DataTable<AllowListRecord>;
  superadminusers: DataTable<SuperAdminUserRecord>;
  logs: DataTable<LogRecord>;
}

export type ConcreteRecord =
  | ConnectionRecord
  | UserRecord
  | UserKeyRecord
  | PermissionRecord
  | WorkspaceRecord
  | SectionRecord
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
  | DocSyncUpdateRecord
  | DocSyncSnapshotRecord
  | LogRecord
  | SecretRecord
  | WorkspaceSubscriptionRecord
  | ResourceUsageRecord;

export type TableRecord = VirtualRecord | ConcreteRecord;

export type ConcreteDataTable = DataTable<ConcreteRecord>;

export type TableName = keyof Omit<ConcreteDataTable, typeof OBSERVED>;

/* DynamoDB */

export interface DynamoDbQuery {
  IndexName?: string;
  KeyConditionExpression?: string;
  ExpressionAttributeValues?: Record<string, string | boolean | number>;
  ExpressionAttributeNames?: Record<string, string>;
  ExclusiveStartKey?: string;
  FilterExpression?: string;
  UpdateExpression?: string;
  Limit?: number;
  ConsistentRead?: boolean;
  Select?: 'COUNT' | 'SPECIFIC_ATTRIBUTES';
  ProjectionExpression?: string;
}

/* Versioned table records */

export interface VersionedTableRecord extends TableRecordBase {
  _version: number;
}

export interface DocSyncRecord extends VersionedTableRecord {
  data?: string;
  seq?: number[];
}

export type DocSyncUpdateRecord = TableRecordBase &
  ({
    seq: string;
  } & (
    | {
        data_file_path?: undefined;
        data: string;
      }
    | {
        data?: undefined;
        data_file_path: string;
      }
  ));

export interface DocSyncSnapshotRecord extends TableRecordBase {
  docsync_id: ID;
  snapshotName: string;
  data?: string;
  data_file_path?: string;
  updatedAt: number;
  version: string;
  isBackup?: boolean;
}

export interface ResourceUsageRecord extends TableRecordBase {
  // Big composite key
  // /resource_type/sub_type/field_name/[users/workspaces]
  // /openai/gpt-4-1106/users
  id: ID;
  consumption: number;

  // Applicable for `extra credit` plans, where you need to know how
  // much you can go up to.
  originalAmount?: number;
}

export interface ResourceUsageHistoryRecord extends TableRecordBase {
  // /workspace/{id}
  resource_uri: string;

  // same as `ResourceUsageRecord` key
  resourceusage_id: string;

  createdAt: number;
  consumption: number;

  timePeriod: 'month';
}

// =================    RESOURCE USAGE    =================

export type ResourceConsumer = 'users' | 'workspaces' | 'pads';
export type StorageSubtypes = 'files';
export type AiSubtypes = 'gpt-4-1106-preview';
export type AiFields = 'promptTokensUsed' | 'completionTokensUsed';
export type QuerySubtypes = 'queries';

export type ResourceTypes = 'openai' | 'storage' | 'queries';

type AiExtraCreditsKeyWithoutID = `openai/extra-credits/null/workspaces`;

export type AiResourceUsageKeyWithoutID =
  | `openai/${AiSubtypes}/${AiFields}/${ResourceConsumer}`
  | AiExtraCreditsKeyWithoutID;

export type AiResourceUsageKey = `${AiResourceUsageKeyWithoutID}/${string}`;

export type StorageResourceUsageKeyWithoutID =
  `storage/${StorageSubtypes}/null/${ResourceConsumer}`;

export type StorageResourceUsageKey =
  `${StorageResourceUsageKeyWithoutID}/${string}`;

export type QueryResourceUsageKeyWithoutId =
  `queries/${QuerySubtypes}/null/${ResourceConsumer}`;

export type QueryResourceUsageKey =
  `${QueryResourceUsageKeyWithoutId}/${string}`;

export type ResourceUsageKeys =
  | AiResourceUsageKey
  | StorageResourceUsageKey
  | QueryResourceUsageKey;

// =============== END RESOURCE USAGE =====================

export type AllowListRecord = TableRecordBase;

export type SuperAdminUserRecord = TableRecordBase;

export type VersionedDataTable<T extends VersionedTableRecord> =
  DataTable<T> & {
    withLock: (
      id: string,
      fn: (record: T | undefined) => PromiseOrType<T>
    ) => Promise<T>;
  };

export interface VersionedDataTables {
  docsync: VersionedDataTable<DocSyncRecord>;
}

/* Lambda */

export type WSRequest = APIGatewayProxyEventV2 & {
  requestContext: {
    connectionId: string;
  };
};

/* GraphQL */

export type GraphqlContext = {
  additionalHeaders: Map<string, string>;
  user?: User;
  anonUser?: AnonUser;
  subscriptionId?: ID;
  connectionId?: ID;
  snapshotName?: string;
  event: APIGatewayProxyEventV2;
  readingModePermission?: boolean;
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
