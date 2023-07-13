import { Resolver as GraphCacheResolver, UpdateResolver as GraphCacheUpdateResolver, OptimisticMutationResolver as GraphCacheOptimisticMutationResolver, StorageAdapter as GraphCacheStorageAdapter } from '@urql/exchange-graphcache';
import { IntrospectionData } from '@urql/exchange-graphcache/dist/types/ast';
import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string | number; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
};

export type Attachment = {
  __typename?: 'Attachment';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  fileName: Scalars['String']['output'];
  fileSize: Scalars['Int']['output'];
  fileType: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  pad?: Maybe<Pad>;
  uploadedBy?: Maybe<User>;
  url: Scalars['String']['output'];
};

export type CreateAttachmentForm = {
  __typename?: 'CreateAttachmentForm';
  fields: Array<KeyValue>;
  handle: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type ExternalDataSource = {
  __typename?: 'ExternalDataSource';
  access: ExternalDataSourceAccess;
  authUrl?: Maybe<Scalars['String']['output']>;
  dataUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  keys: Array<ExternalKey>;
  name: Scalars['String']['output'];
  padId?: Maybe<Scalars['ID']['output']>;
  provider: ExternalProvider;
  workspaceId?: Maybe<Scalars['ID']['output']>;
};

export type ExternalDataSourceAccess = {
  __typename?: 'ExternalDataSourceAccess';
  roles: Array<RoleAccess>;
  users: Array<UserAccess>;
};

export type ExternalDataSourceCreateInput = {
  dataSourceName?: InputMaybe<Scalars['String']['input']>;
  externalId: Scalars['String']['input'];
  name: Scalars['String']['input'];
  padId?: InputMaybe<Scalars['ID']['input']>;
  provider: ExternalProvider;
  workspace_id?: InputMaybe<Scalars['ID']['input']>;
};

export type ExternalDataSourceUpdateInput = {
  dataSourceName?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type ExternalKey = {
  __typename?: 'ExternalKey';
  createdAt: Scalars['DateTime']['output'];
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  lastError?: Maybe<Scalars['String']['output']>;
  lastUsedAt?: Maybe<Scalars['DateTime']['output']>;
};

export enum ExternalProvider {
  Cockroachdb = 'cockroachdb',
  Csv = 'csv',
  Decipad = 'decipad',
  Gsheets = 'gsheets',
  Json = 'json',
  Mariadb = 'mariadb',
  Mssql = 'mssql',
  Mysql = 'mysql',
  Oracledb = 'oracledb',
  Postgresql = 'postgresql',
  Redshift = 'redshift'
}

export type GoalFulfilmentInput = {
  goalName: Scalars['String']['input'];
};

export type KeyValue = {
  __typename?: 'KeyValue';
  key: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type LogEntry = {
  content: Scalars['String']['input'];
  createdAt: Scalars['DateTime']['input'];
  source: Scalars['String']['input'];
};

export type LogInput = {
  entries: Array<LogEntry>;
  resource: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addNotebookToSection?: Maybe<Scalars['Boolean']['output']>;
  addSectionToWorkspace?: Maybe<Section>;
  addTagToPad?: Maybe<Scalars['Boolean']['output']>;
  attachFileToPad?: Maybe<Attachment>;
  createExternalDataSource?: Maybe<ExternalDataSource>;
  createLogs?: Maybe<Scalars['Boolean']['output']>;
  createOrUpdateSnapshot: Scalars['Boolean']['output'];
  createPad: Pad;
  createRole: Role;
  createSecret: Secret;
  createUserViaMagicLink: User;
  createWorkspace: Workspace;
  doNothing?: Maybe<Scalars['Boolean']['output']>;
  duplicatePad: Pad;
  fulfilGoal: Scalars['Boolean']['output'];
  getCreateAttachmentForm: CreateAttachmentForm;
  importPad: Pad;
  inviteUserToRole: Array<RoleInvitation>;
  movePad: Pad;
  pretendUser?: Maybe<Scalars['Boolean']['output']>;
  removeAttachmentFromPad?: Maybe<Scalars['Boolean']['output']>;
  removeExternalDataSource?: Maybe<Scalars['Boolean']['output']>;
  removePad?: Maybe<Scalars['Boolean']['output']>;
  removeRole?: Maybe<Scalars['Boolean']['output']>;
  removeSecret: Scalars['Boolean']['output'];
  removeSectionFromWorkspace?: Maybe<Scalars['Boolean']['output']>;
  removeSelfFromRole?: Maybe<Scalars['Boolean']['output']>;
  removeTagFromPad?: Maybe<Scalars['Boolean']['output']>;
  removeUserFromRole?: Maybe<Scalars['Boolean']['output']>;
  removeWorkspace?: Maybe<Scalars['Boolean']['output']>;
  resendRegistrationMagicLinkEmail?: Maybe<Scalars['Boolean']['output']>;
  setPadPublic: Scalars['Boolean']['output'];
  setUsername: Scalars['Boolean']['output'];
  shareExternalDataSourceWithEmail?: Maybe<ExternalDataSource>;
  shareExternalDataSourceWithRole?: Maybe<Scalars['Boolean']['output']>;
  shareExternalDataSourceWithUser?: Maybe<ExternalDataSource>;
  sharePadWithEmail: Pad;
  sharePadWithRole?: Maybe<Scalars['Boolean']['output']>;
  sharePadWithSecret: Scalars['String']['output'];
  sharePadWithUser?: Maybe<Pad>;
  shareWorkspaceWithEmail: Workspace;
  syncWorkspaceSeats: WorkspaceSubscription;
  unshareExternalDataSourceWithRole?: Maybe<Scalars['Boolean']['output']>;
  unshareExternalDataSourceWithUser: ExternalDataSource;
  unshareNotebookWithSecret?: Maybe<Scalars['Boolean']['output']>;
  unsharePadWithRole?: Maybe<Scalars['Boolean']['output']>;
  unsharePadWithUser?: Maybe<Pad>;
  unshareWorkspaceWithUser?: Maybe<Workspace>;
  updateExternalDataSource?: Maybe<ExternalDataSource>;
  updatePad: Pad;
  updateSecret: Secret;
  updateSectionInWorkspace?: Maybe<Scalars['Boolean']['output']>;
  updateSelf: User;
  updateWorkspace: Workspace;
};


export type MutationAddNotebookToSectionArgs = {
  notebookId: Scalars['ID']['input'];
  sectionId: Scalars['ID']['input'];
};


export type MutationAddSectionToWorkspaceArgs = {
  section: SectionInput;
  workspaceId: Scalars['ID']['input'];
};


export type MutationAddTagToPadArgs = {
  padId: Scalars['ID']['input'];
  tag: Scalars['String']['input'];
};


export type MutationAttachFileToPadArgs = {
  handle: Scalars['ID']['input'];
};


export type MutationCreateExternalDataSourceArgs = {
  dataSource: ExternalDataSourceCreateInput;
};


export type MutationCreateLogsArgs = {
  input: LogInput;
};


export type MutationCreateOrUpdateSnapshotArgs = {
  notebookId: Scalars['ID']['input'];
  snapshotName: Scalars['String']['input'];
};


export type MutationCreatePadArgs = {
  pad: PadInput;
  sectionId?: InputMaybe<Scalars['ID']['input']>;
  workspaceId: Scalars['ID']['input'];
};


export type MutationCreateRoleArgs = {
  role?: InputMaybe<RoleInput>;
};


export type MutationCreateSecretArgs = {
  secret: SecretInput;
  workspaceId: Scalars['ID']['input'];
};


export type MutationCreateUserViaMagicLinkArgs = {
  email: Scalars['String']['input'];
};


export type MutationCreateWorkspaceArgs = {
  workspace: WorkspaceInput;
};


export type MutationDuplicatePadArgs = {
  document?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  targetWorkspace: Scalars['ID']['input'];
};


export type MutationFulfilGoalArgs = {
  props: GoalFulfilmentInput;
};


export type MutationGetCreateAttachmentFormArgs = {
  fileName: Scalars['String']['input'];
  fileType: Scalars['String']['input'];
  padId: Scalars['ID']['input'];
};


export type MutationImportPadArgs = {
  source: Scalars['String']['input'];
  workspaceId: Scalars['ID']['input'];
};


export type MutationInviteUserToRoleArgs = {
  permission: PermissionType;
  roleId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationMovePadArgs = {
  id: Scalars['ID']['input'];
  workspaceId: Scalars['ID']['input'];
};


export type MutationPretendUserArgs = {
  userId: Scalars['ID']['input'];
};


export type MutationRemoveAttachmentFromPadArgs = {
  attachmentId: Scalars['ID']['input'];
};


export type MutationRemoveExternalDataSourceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRemovePadArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRemoveRoleArgs = {
  roleId: Scalars['ID']['input'];
};


export type MutationRemoveSecretArgs = {
  secretId: Scalars['ID']['input'];
};


export type MutationRemoveSectionFromWorkspaceArgs = {
  sectionId: Scalars['ID']['input'];
  workspaceId: Scalars['ID']['input'];
};


export type MutationRemoveSelfFromRoleArgs = {
  roleId: Scalars['ID']['input'];
};


export type MutationRemoveTagFromPadArgs = {
  padId: Scalars['ID']['input'];
  tag: Scalars['String']['input'];
};


export type MutationRemoveUserFromRoleArgs = {
  roleId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationRemoveWorkspaceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationResendRegistrationMagicLinkEmailArgs = {
  email: Scalars['String']['input'];
};


export type MutationSetPadPublicArgs = {
  id: Scalars['ID']['input'];
  isPublic: Scalars['Boolean']['input'];
};


export type MutationSetUsernameArgs = {
  props: UsernameInput;
};


export type MutationShareExternalDataSourceWithEmailArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  permissionType: PermissionType;
};


export type MutationShareExternalDataSourceWithRoleArgs = {
  id: Scalars['ID']['input'];
  permissionType: PermissionType;
  roleId: Scalars['ID']['input'];
};


export type MutationShareExternalDataSourceWithUserArgs = {
  id: Scalars['ID']['input'];
  permissionType: PermissionType;
  userId: Scalars['ID']['input'];
};


export type MutationSharePadWithEmailArgs = {
  canComment: Scalars['Boolean']['input'];
  email: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  permissionType: PermissionType;
};


export type MutationSharePadWithRoleArgs = {
  canComment: Scalars['Boolean']['input'];
  id: Scalars['ID']['input'];
  permissionType: PermissionType;
  roleId: Scalars['ID']['input'];
};


export type MutationSharePadWithSecretArgs = {
  canComment: Scalars['Boolean']['input'];
  id: Scalars['ID']['input'];
  permissionType: PermissionType;
};


export type MutationSharePadWithUserArgs = {
  canComment: Scalars['Boolean']['input'];
  id: Scalars['ID']['input'];
  permissionType: PermissionType;
  userId: Scalars['ID']['input'];
};


export type MutationShareWorkspaceWithEmailArgs = {
  canComment: Scalars['Boolean']['input'];
  email: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  permissionType: PermissionType;
};


export type MutationSyncWorkspaceSeatsArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUnshareExternalDataSourceWithRoleArgs = {
  id: Scalars['ID']['input'];
  roleId: Scalars['ID']['input'];
};


export type MutationUnshareExternalDataSourceWithUserArgs = {
  id: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationUnshareNotebookWithSecretArgs = {
  id: Scalars['ID']['input'];
  secret: Scalars['String']['input'];
};


export type MutationUnsharePadWithRoleArgs = {
  id: Scalars['ID']['input'];
  roleId: Scalars['ID']['input'];
};


export type MutationUnsharePadWithUserArgs = {
  id: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationUnshareWorkspaceWithUserArgs = {
  id: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationUpdateExternalDataSourceArgs = {
  dataSource: ExternalDataSourceUpdateInput;
  id: Scalars['ID']['input'];
};


export type MutationUpdatePadArgs = {
  id: Scalars['ID']['input'];
  pad: PadInput;
};


export type MutationUpdateSecretArgs = {
  secret: Scalars['String']['input'];
  secretId: Scalars['ID']['input'];
};


export type MutationUpdateSectionInWorkspaceArgs = {
  section: SectionInput;
  sectionId: Scalars['ID']['input'];
  workspaceId: Scalars['ID']['input'];
};


export type MutationUpdateSelfArgs = {
  props: UserInput;
};


export type MutationUpdateWorkspaceArgs = {
  id: Scalars['ID']['input'];
  workspace: WorkspaceInput;
};

export type Pad = {
  __typename?: 'Pad';
  access: PadAccess;
  archived?: Maybe<Scalars['Boolean']['output']>;
  attachments: Array<Attachment>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  initialState?: Maybe<Scalars['String']['output']>;
  isPublic?: Maybe<Scalars['Boolean']['output']>;
  myPermissionType?: Maybe<PermissionType>;
  name: Scalars['String']['output'];
  padConnectionParams: PadConnectionParams;
  section?: Maybe<Section>;
  snapshots: Array<PadSnapshot>;
  status?: Maybe<Scalars['String']['output']>;
  tags: Array<Scalars['String']['output']>;
  workspace?: Maybe<Workspace>;
};

export type PadAccess = {
  __typename?: 'PadAccess';
  roles?: Maybe<Array<RoleAccess>>;
  secrets?: Maybe<Array<SecretAccess>>;
  users?: Maybe<Array<UserAccess>>;
};

export type PadChanges = {
  __typename?: 'PadChanges';
  added: Array<Pad>;
  removed: Array<Scalars['ID']['output']>;
  updated: Array<Pad>;
};

export type PadConnectionParams = {
  __typename?: 'PadConnectionParams';
  token: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type PadInput = {
  archived?: InputMaybe<Scalars['Boolean']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  section_id?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type PadSnapshot = {
  __typename?: 'PadSnapshot';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  data?: Maybe<Scalars['String']['output']>;
  snapshotName: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  version?: Maybe<Scalars['String']['output']>;
};

export type PageInput = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  maxItems: Scalars['Int']['input'];
};

export type Pageable = ExternalDataSource | SharedResource;

export type PagedPadResult = {
  __typename?: 'PagedPadResult';
  count: Scalars['Int']['output'];
  cursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  items: Array<Pad>;
};

export type PagedResult = {
  __typename?: 'PagedResult';
  count: Scalars['Int']['output'];
  cursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  items: Array<Pageable>;
};

export type Permission = {
  __typename?: 'Permission';
  canComment: Scalars['Boolean']['output'];
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  givenBy: User;
  id: Scalars['ID']['output'];
  resource: Scalars['String']['output'];
  type: PermissionType;
  user: User;
};

export enum PermissionType {
  Admin = 'ADMIN',
  Read = 'READ',
  Write = 'WRITE'
}

export type Query = {
  __typename?: 'Query';
  featuredPad?: Maybe<Pad>;
  getExternalDataSource: ExternalDataSource;
  getExternalDataSources: PagedResult;
  getExternalDataSourcesWorkspace: PagedResult;
  getPadById?: Maybe<Pad>;
  getWorkspaceById?: Maybe<Workspace>;
  getWorkspaceSecrets: Array<Secret>;
  me?: Maybe<User>;
  pads: PagedPadResult;
  padsByTag: PagedPadResult;
  padsSharedWithMe: PagedPadResult;
  sections: Array<Section>;
  self?: Maybe<User>;
  selfFulfilledGoals: Array<Scalars['String']['output']>;
  tags: Array<Scalars['String']['output']>;
  version?: Maybe<Scalars['String']['output']>;
  workspaces: Array<Workspace>;
};


export type QueryGetExternalDataSourceArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetExternalDataSourcesArgs = {
  notebookId: Scalars['ID']['input'];
  page: PageInput;
};


export type QueryGetExternalDataSourcesWorkspaceArgs = {
  page: PageInput;
  workspaceId: Scalars['ID']['input'];
};


export type QueryGetPadByIdArgs = {
  id: Scalars['ID']['input'];
  snapshotName?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetWorkspaceByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetWorkspaceSecretsArgs = {
  workspaceId: Scalars['ID']['input'];
};


export type QueryPadsArgs = {
  page: PageInput;
  workspaceId: Scalars['ID']['input'];
};


export type QueryPadsByTagArgs = {
  page: PageInput;
  tag: Scalars['String']['input'];
  workspaceId: Scalars['ID']['input'];
};


export type QueryPadsSharedWithMeArgs = {
  page: PageInput;
};


export type QuerySectionsArgs = {
  workspaceId: Scalars['ID']['input'];
};


export type QueryTagsArgs = {
  workspaceId: Scalars['ID']['input'];
};

export type Role = {
  __typename?: 'Role';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  users: Array<User>;
  workspace: Workspace;
};

export type RoleAccess = {
  __typename?: 'RoleAccess';
  canComment: Scalars['Boolean']['output'];
  permission: PermissionType;
  role: Role;
};

export type RoleInput = {
  name: Scalars['String']['input'];
  workspaceId: Scalars['ID']['input'];
};

export type RoleInvitation = {
  __typename?: 'RoleInvitation';
  expires_at?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  role: Role;
  user: User;
};

export type Secret = {
  __typename?: 'Secret';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  workspace?: Maybe<Workspace>;
};

export type SecretAccess = {
  __typename?: 'SecretAccess';
  canComment: Scalars['Boolean']['output'];
  permission: PermissionType;
  secret: Scalars['String']['output'];
};

export type SecretInput = {
  name: Scalars['String']['input'];
  secret: Scalars['String']['input'];
};

export type Section = {
  __typename?: 'Section';
  color: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  pads: Array<Pad>;
  workspace_id: Scalars['ID']['output'];
};

export type SectionChanges = {
  __typename?: 'SectionChanges';
  added: Array<Section>;
  removed: Array<Scalars['ID']['output']>;
  updated: Array<Section>;
};

export type SectionInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type ShareInvitation = {
  __typename?: 'ShareInvitation';
  email?: Maybe<Scalars['String']['output']>;
};

export type SharedResource = {
  __typename?: 'SharedResource';
  canComment?: Maybe<Scalars['Boolean']['output']>;
  permission: PermissionType;
  resource: Scalars['String']['output'];
};

export type SharedWith = {
  __typename?: 'SharedWith';
  pendingInvitations: Array<ShareInvitation>;
  roles: Array<SharedWithRole>;
  users: Array<SharedWithUser>;
};

export type SharedWithRole = {
  __typename?: 'SharedWithRole';
  canComment: Scalars['Boolean']['output'];
  permissionType: PermissionType;
  role: Role;
};

export type SharedWithUser = {
  __typename?: 'SharedWithUser';
  canComment: Scalars['Boolean']['output'];
  permissionType: PermissionType;
  user: User;
};

export type Subscription = {
  __typename?: 'Subscription';
  hello?: Maybe<Scalars['String']['output']>;
  padsChanged: PadChanges;
  sectionsChanged: SectionChanges;
  subscribeToNothing?: Maybe<Scalars['Boolean']['output']>;
  tagsChanged: TagChanges;
  workspacesChanged: WorkspacesChanges;
};


export type SubscriptionPadsChangedArgs = {
  workspaceId: Scalars['ID']['input'];
};


export type SubscriptionSectionsChangedArgs = {
  workspaceId: Scalars['ID']['input'];
};


export type SubscriptionTagsChangedArgs = {
  workspaceId: Scalars['ID']['input'];
};

export enum SubscriptionPaymentStatus {
  NoPaymentRequired = 'no_payment_required',
  Paid = 'paid',
  Unpaid = 'unpaid'
}

export enum SubscriptionStatus {
  Active = 'active',
  Canceled = 'canceled',
  Incomplete = 'incomplete',
  IncompleteExpired = 'incomplete_expired',
  PastDue = 'past_due',
  Paused = 'paused',
  Trialing = 'trialing',
  Unpaid = 'unpaid'
}

export type TagChanges = {
  __typename?: 'TagChanges';
  added: Array<TagRecord>;
  removed: Array<TagRecord>;
};

export type TagRecord = {
  __typename?: 'TagRecord';
  tag: Scalars['String']['output'];
  workspaceId: Scalars['ID']['output'];
};

export type User = {
  __typename?: 'User';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  emailValidatedAt?: Maybe<Scalars['DateTime']['output']>;
  hideChecklist?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  onboarded?: Maybe<Scalars['Boolean']['output']>;
  username?: Maybe<Scalars['String']['output']>;
};

export type UserAccess = {
  __typename?: 'UserAccess';
  canComment: Scalars['Boolean']['output'];
  permission: PermissionType;
  user: User;
};

export type UserInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  hideChecklist?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  onboarded?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UsernameInput = {
  username: Scalars['String']['input'];
};

export type Workspace = {
  __typename?: 'Workspace';
  access?: Maybe<WorkspaceAccess>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  isPremium?: Maybe<Scalars['Boolean']['output']>;
  isPublic?: Maybe<Scalars['Boolean']['output']>;
  membersCount: Scalars['Int']['output'];
  myPermissionType?: Maybe<PermissionType>;
  name: Scalars['String']['output'];
  pads: PagedPadResult;
  roles: Array<Role>;
  secrets: Array<Secret>;
  sections: Array<Section>;
  workspaceSubscription?: Maybe<WorkspaceSubscription>;
};


export type WorkspacePadsArgs = {
  page: PageInput;
};

export type WorkspaceAccess = {
  __typename?: 'WorkspaceAccess';
  roles?: Maybe<Array<RoleAccess>>;
  users?: Maybe<Array<UserAccess>>;
};

export type WorkspaceInput = {
  name: Scalars['String']['input'];
};

export type WorkspaceSubscription = {
  __typename?: 'WorkspaceSubscription';
  customer_id?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  paymentLink?: Maybe<Scalars['String']['output']>;
  paymentStatus?: Maybe<SubscriptionPaymentStatus>;
  seats?: Maybe<Scalars['Int']['output']>;
  status?: Maybe<SubscriptionStatus>;
  workspace?: Maybe<Workspace>;
};

export type WorkspacesChanges = {
  __typename?: 'WorkspacesChanges';
  added: Array<Workspace>;
  removed: Array<Scalars['ID']['output']>;
  updated: Array<Workspace>;
};

export type AttachFileToNotebookMutationVariables = Exact<{
  handle: Scalars['ID']['input'];
}>;


export type AttachFileToNotebookMutation = { __typename?: 'Mutation', attachFileToPad?: { __typename?: 'Attachment', url: string } | null };

export type ChangeWorkspaceAccessLevelMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  email: Scalars['String']['input'];
  permissionType: PermissionType;
  canComment: Scalars['Boolean']['input'];
}>;


export type ChangeWorkspaceAccessLevelMutation = { __typename?: 'Mutation', shareWorkspaceWithEmail: { __typename?: 'Workspace', id: string, access?: { __typename?: 'WorkspaceAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user: { __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null, emailValidatedAt?: any | null } }> | null, roles?: Array<{ __typename?: 'RoleAccess', permission: PermissionType, role: { __typename?: 'Role', id: string, users: Array<{ __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null, emailValidatedAt?: any | null }> } }> | null } | null } };

export type CreateExternalDataSourceMutationVariables = Exact<{
  dataSource: ExternalDataSourceCreateInput;
}>;


export type CreateExternalDataSourceMutation = { __typename?: 'Mutation', createExternalDataSource?: { __typename?: 'ExternalDataSource', id: string, name: string, workspaceId?: string | null, padId?: string | null, provider: ExternalProvider, dataUrl?: string | null, authUrl?: string | null, keys: Array<{ __typename?: 'ExternalKey', lastError?: string | null, createdAt: any, expiresAt?: any | null, lastUsedAt?: any | null }> } | null };

export type CreateLogsMutationVariables = Exact<{
  resource: Scalars['String']['input'];
  entries: Array<LogEntry> | LogEntry;
}>;


export type CreateLogsMutation = { __typename?: 'Mutation', createLogs?: boolean | null };

export type CreateNotebookMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  sectionId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type CreateNotebookMutation = { __typename?: 'Mutation', createPad: { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, isPublic?: boolean | null, initialState?: string | null, status?: string | null, createdAt?: any | null, archived?: boolean | null, access: { __typename?: 'PadAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user: { __typename?: 'User', id: string, image?: string | null, name: string, email?: string | null, username?: string | null, onboarded?: boolean | null, emailValidatedAt?: any | null } }> | null }, workspace?: { __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, snapshots: Array<{ __typename?: 'PadSnapshot', snapshotName: string, createdAt?: any | null, updatedAt?: any | null, data?: string | null, version?: string | null }>, section?: { __typename?: 'Section', id: string, name: string } | null } };

export type CreateSectionMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  color: Scalars['String']['input'];
}>;


export type CreateSectionMutation = { __typename?: 'Mutation', addSectionToWorkspace?: { __typename?: 'Section', id: string, name: string, color: string, createdAt?: any | null } | null };

export type CreateOrUpdateNotebookSnapshotMutationVariables = Exact<{
  notebookId: Scalars['ID']['input'];
  snapshotName: Scalars['String']['input'];
}>;


export type CreateOrUpdateNotebookSnapshotMutation = { __typename?: 'Mutation', createOrUpdateSnapshot: boolean };

export type CreateWorkspaceMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type CreateWorkspaceMutation = { __typename?: 'Mutation', createWorkspace: { __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null, membersCount: number, pads: { __typename?: 'PagedPadResult', items: Array<{ __typename?: 'Pad', id: string, name: string, icon?: string | null, status?: string | null, createdAt?: any | null, archived?: boolean | null, isPublic?: boolean | null, myPermissionType?: PermissionType | null, section?: { __typename?: 'Section', id: string, name: string } | null }> }, workspaceSubscription?: { __typename?: 'WorkspaceSubscription', paymentStatus?: SubscriptionPaymentStatus | null } | null, sections: Array<{ __typename?: 'Section', id: string, name: string, color: string, createdAt?: any | null, pads: Array<{ __typename?: 'Pad', id: string, name: string, icon?: string | null, status?: string | null, createdAt?: any | null, archived?: boolean | null, isPublic?: boolean | null, myPermissionType?: PermissionType | null, section?: { __typename?: 'Section', id: string, name: string } | null }> }>, access?: { __typename?: 'WorkspaceAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user: { __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null, emailValidatedAt?: any | null } }> | null, roles?: Array<{ __typename?: 'RoleAccess', permission: PermissionType, role: { __typename?: 'Role', id: string, users: Array<{ __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null, emailValidatedAt?: any | null }> } }> | null } | null } };

export type CreateWorkspaceSecretMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  secret: SecretInput;
}>;


export type CreateWorkspaceSecretMutation = { __typename?: 'Mutation', createSecret: { __typename?: 'Secret', id: string, name: string } };

export type DeleteNotebookMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteNotebookMutation = { __typename?: 'Mutation', removePad?: boolean | null };

export type DeleteSectionMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  sectionId: Scalars['ID']['input'];
}>;


export type DeleteSectionMutation = { __typename?: 'Mutation', removeSectionFromWorkspace?: boolean | null };

export type DeleteWorkspaceMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteWorkspaceMutation = { __typename?: 'Mutation', removeWorkspace?: boolean | null };

export type DeleteWorkspaceSecretMutationVariables = Exact<{
  secretId: Scalars['ID']['input'];
}>;


export type DeleteWorkspaceSecretMutation = { __typename?: 'Mutation', removeSecret: boolean };

export type DuplicateNotebookMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  targetWorkspace: Scalars['ID']['input'];
  document?: InputMaybe<Scalars['String']['input']>;
}>;


export type DuplicateNotebookMutation = { __typename?: 'Mutation', duplicatePad: { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, isPublic?: boolean | null, initialState?: string | null, status?: string | null, createdAt?: any | null, archived?: boolean | null, access: { __typename?: 'PadAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user: { __typename?: 'User', id: string, image?: string | null, name: string, email?: string | null, username?: string | null, onboarded?: boolean | null, emailValidatedAt?: any | null } }> | null }, workspace?: { __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, snapshots: Array<{ __typename?: 'PadSnapshot', snapshotName: string, createdAt?: any | null, updatedAt?: any | null, data?: string | null, version?: string | null }>, section?: { __typename?: 'Section', id: string, name: string } | null } };

export type FulfilGoalMutationVariables = Exact<{
  props: GoalFulfilmentInput;
}>;


export type FulfilGoalMutation = { __typename?: 'Mutation', fulfilGoal: boolean };

export type GetCreateAttachmentFormMutationVariables = Exact<{
  notebookId: Scalars['ID']['input'];
  fileName: Scalars['String']['input'];
  fileType: Scalars['String']['input'];
}>;


export type GetCreateAttachmentFormMutation = { __typename?: 'Mutation', getCreateAttachmentForm: { __typename?: 'CreateAttachmentForm', url: string, handle: string, fields: Array<{ __typename?: 'KeyValue', key: string, value: string }> } };

export type ImportNotebookMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  source: Scalars['String']['input'];
}>;


export type ImportNotebookMutation = { __typename?: 'Mutation', importPad: { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, isPublic?: boolean | null, initialState?: string | null, status?: string | null, createdAt?: any | null, archived?: boolean | null, access: { __typename?: 'PadAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user: { __typename?: 'User', id: string, image?: string | null, name: string, email?: string | null, username?: string | null, onboarded?: boolean | null, emailValidatedAt?: any | null } }> | null }, workspace?: { __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, snapshots: Array<{ __typename?: 'PadSnapshot', snapshotName: string, createdAt?: any | null, updatedAt?: any | null, data?: string | null, version?: string | null }>, section?: { __typename?: 'Section', id: string, name: string } | null } };

export type MoveNotebookMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  workspaceId: Scalars['ID']['input'];
}>;


export type MoveNotebookMutation = { __typename?: 'Mutation', movePad: { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, isPublic?: boolean | null, initialState?: string | null, status?: string | null, createdAt?: any | null, archived?: boolean | null, access: { __typename?: 'PadAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user: { __typename?: 'User', id: string, image?: string | null, name: string, email?: string | null, username?: string | null, onboarded?: boolean | null, emailValidatedAt?: any | null } }> | null }, workspace?: { __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, snapshots: Array<{ __typename?: 'PadSnapshot', snapshotName: string, createdAt?: any | null, updatedAt?: any | null, data?: string | null, version?: string | null }>, section?: { __typename?: 'Section', id: string, name: string } | null } };

export type RenameNotebookMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
}>;


export type RenameNotebookMutation = { __typename?: 'Mutation', updatePad: { __typename?: 'Pad', id: string, name: string } };

export type RenameWorkspaceMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
}>;


export type RenameWorkspaceMutation = { __typename?: 'Mutation', updateWorkspace: { __typename?: 'Workspace', id: string, name: string } };

export type SetNotebookPublicMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  isPublic: Scalars['Boolean']['input'];
}>;


export type SetNotebookPublicMutation = { __typename?: 'Mutation', setPadPublic: boolean };

export type SetUsernameMutationVariables = Exact<{
  props: UsernameInput;
}>;


export type SetUsernameMutation = { __typename?: 'Mutation', setUsername: boolean };

export type ShareNotebookWithSecretMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  permissionType: PermissionType;
  canComment: Scalars['Boolean']['input'];
}>;


export type ShareNotebookWithSecretMutation = { __typename?: 'Mutation', sharePadWithSecret: string };

export type SharePadWithEmailMutationVariables = Exact<{
  padId: Scalars['ID']['input'];
  email: Scalars['String']['input'];
  permissionType: PermissionType;
  canComment: Scalars['Boolean']['input'];
}>;


export type SharePadWithEmailMutation = { __typename?: 'Mutation', sharePadWithEmail: { __typename?: 'Pad', id: string, name: string, access: { __typename?: 'PadAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, canComment: boolean, user: { __typename?: 'User', id: string, image?: string | null, name: string, email?: string | null, username?: string | null, onboarded?: boolean | null, emailValidatedAt?: any | null } }> | null } } };

export type ShareWorkspaceWithEmailMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  email: Scalars['String']['input'];
  permissionType: PermissionType;
  canComment: Scalars['Boolean']['input'];
}>;


export type ShareWorkspaceWithEmailMutation = { __typename?: 'Mutation', shareWorkspaceWithEmail: { __typename?: 'Workspace', id: string, access?: { __typename?: 'WorkspaceAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user: { __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null, emailValidatedAt?: any | null } }> | null, roles?: Array<{ __typename?: 'RoleAccess', permission: PermissionType, role: { __typename?: 'Role', id: string, users: Array<{ __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null, emailValidatedAt?: any | null }> } }> | null } | null } };

export type UnarchiveNotebookMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UnarchiveNotebookMutation = { __typename?: 'Mutation', updatePad: { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, isPublic?: boolean | null, initialState?: string | null, access: { __typename?: 'PadAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user: { __typename?: 'User', id: string, image?: string | null, name: string, email?: string | null, username?: string | null, onboarded?: boolean | null, emailValidatedAt?: any | null } }> | null }, workspace?: { __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, snapshots: Array<{ __typename?: 'PadSnapshot', snapshotName: string, createdAt?: any | null, updatedAt?: any | null, data?: string | null, version?: string | null }> } };

export type UnshareNotebookWithSecretMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  secret: Scalars['String']['input'];
}>;


export type UnshareNotebookWithSecretMutation = { __typename?: 'Mutation', unshareNotebookWithSecret?: boolean | null };

export type UnsharePadWithUserMutationVariables = Exact<{
  padId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
}>;


export type UnsharePadWithUserMutation = { __typename?: 'Mutation', unsharePadWithUser?: { __typename?: 'Pad', id: string, name: string, access: { __typename?: 'PadAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, canComment: boolean, user: { __typename?: 'User', id: string, image?: string | null, name: string, email?: string | null, username?: string | null, onboarded?: boolean | null, emailValidatedAt?: any | null } }> | null } } | null };

export type UnshareWorkspaceWithUserMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
}>;


export type UnshareWorkspaceWithUserMutation = { __typename?: 'Mutation', unshareWorkspaceWithUser?: { __typename?: 'Workspace', id: string, access?: { __typename?: 'WorkspaceAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user: { __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null, emailValidatedAt?: any | null } }> | null, roles?: Array<{ __typename?: 'RoleAccess', permission: PermissionType, role: { __typename?: 'Role', id: string, users: Array<{ __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null, emailValidatedAt?: any | null }> } }> | null } | null } | null };

export type UpdateNotebookArchiveMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UpdateNotebookArchiveMutation = { __typename?: 'Mutation', updatePad: { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, isPublic?: boolean | null, initialState?: string | null, access: { __typename?: 'PadAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user: { __typename?: 'User', id: string, image?: string | null, name: string, email?: string | null, username?: string | null, onboarded?: boolean | null, emailValidatedAt?: any | null } }> | null }, workspace?: { __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, snapshots: Array<{ __typename?: 'PadSnapshot', snapshotName: string, createdAt?: any | null, updatedAt?: any | null, data?: string | null, version?: string | null }> } };

export type UpdateNotebookIconMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  icon: Scalars['String']['input'];
}>;


export type UpdateNotebookIconMutation = { __typename?: 'Mutation', updatePad: { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, isPublic?: boolean | null, initialState?: string | null, access: { __typename?: 'PadAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user: { __typename?: 'User', id: string, image?: string | null, name: string, email?: string | null, username?: string | null, onboarded?: boolean | null, emailValidatedAt?: any | null } }> | null }, workspace?: { __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, snapshots: Array<{ __typename?: 'PadSnapshot', snapshotName: string, createdAt?: any | null, updatedAt?: any | null, data?: string | null, version?: string | null }> } };

export type UpdateNotebookStatusMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  status: Scalars['String']['input'];
}>;


export type UpdateNotebookStatusMutation = { __typename?: 'Mutation', updatePad: { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, isPublic?: boolean | null, initialState?: string | null, access: { __typename?: 'PadAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user: { __typename?: 'User', id: string, image?: string | null, name: string, email?: string | null, username?: string | null, onboarded?: boolean | null, emailValidatedAt?: any | null } }> | null }, workspace?: { __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, snapshots: Array<{ __typename?: 'PadSnapshot', snapshotName: string, createdAt?: any | null, updatedAt?: any | null, data?: string | null, version?: string | null }> } };

export type UpdatePadPermissionMutationVariables = Exact<{
  padId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
  permissionType: PermissionType;
  canComment: Scalars['Boolean']['input'];
}>;


export type UpdatePadPermissionMutation = { __typename?: 'Mutation', unsharePadWithUser?: { __typename?: 'Pad', id: string, name: string, access: { __typename?: 'PadAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, canComment: boolean, user: { __typename?: 'User', id: string, image?: string | null, name: string, email?: string | null, username?: string | null, onboarded?: boolean | null, emailValidatedAt?: any | null } }> | null } } | null, sharePadWithUser?: { __typename?: 'Pad', id: string, name: string, access: { __typename?: 'PadAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, canComment: boolean, user: { __typename?: 'User', id: string, image?: string | null, name: string, email?: string | null, username?: string | null, onboarded?: boolean | null, emailValidatedAt?: any | null } }> | null } } | null };

export type UpdateSectionMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  sectionId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  color: Scalars['String']['input'];
}>;


export type UpdateSectionMutation = { __typename?: 'Mutation', updateSectionInWorkspace?: boolean | null };

export type UpdateSectionAddNotebookMutationVariables = Exact<{
  sectionId: Scalars['ID']['input'];
  notebookId: Scalars['ID']['input'];
}>;


export type UpdateSectionAddNotebookMutation = { __typename?: 'Mutation', addNotebookToSection?: boolean | null };

export type UpdateUserMutationVariables = Exact<{
  props: UserInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateSelf: { __typename?: 'User', name: string, description?: string | null, hideChecklist?: boolean | null, onboarded?: boolean | null } };

export type ExternalDataSourceFragmentFragment = { __typename?: 'ExternalDataSource', id: string, name: string, workspaceId?: string | null, padId?: string | null, provider: ExternalProvider, dataUrl?: string | null, authUrl?: string | null, keys: Array<{ __typename?: 'ExternalKey', lastError?: string | null, createdAt: any, expiresAt?: any | null, lastUsedAt?: any | null }> };

export type GetExternalDataSourcesQueryVariables = Exact<{
  notebookId: Scalars['ID']['input'];
}>;


export type GetExternalDataSourcesQuery = { __typename?: 'Query', getExternalDataSources: { __typename?: 'PagedResult', items: Array<{ __typename?: 'ExternalDataSource', id: string, name: string, workspaceId?: string | null, padId?: string | null, provider: ExternalProvider, dataUrl?: string | null, authUrl?: string | null, keys: Array<{ __typename?: 'ExternalKey', lastError?: string | null, createdAt: any, expiresAt?: any | null, lastUsedAt?: any | null }> } | { __typename?: 'SharedResource' }> } };

export type GetExternalDataSourcesWorkspaceQueryVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
}>;


export type GetExternalDataSourcesWorkspaceQuery = { __typename?: 'Query', getExternalDataSourcesWorkspace: { __typename?: 'PagedResult', items: Array<{ __typename?: 'ExternalDataSource', id: string, name: string, workspaceId?: string | null, padId?: string | null, provider: ExternalProvider, dataUrl?: string | null, authUrl?: string | null, keys: Array<{ __typename?: 'ExternalKey', lastError?: string | null, createdAt: any, expiresAt?: any | null, lastUsedAt?: any | null }> } | { __typename?: 'SharedResource' }> } };

export type NotebookSnapshotFragment = { __typename?: 'PadSnapshot', snapshotName: string, createdAt?: any | null, updatedAt?: any | null, data?: string | null, version?: string | null };

export type CollaboratorFragment = { __typename?: 'User', id: string, image?: string | null, name: string, email?: string | null, username?: string | null, onboarded?: boolean | null, emailValidatedAt?: any | null };

export type EditorNotebookFragment = { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, isPublic?: boolean | null, initialState?: string | null, access: { __typename?: 'PadAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user: { __typename?: 'User', id: string, image?: string | null, name: string, email?: string | null, username?: string | null, onboarded?: boolean | null, emailValidatedAt?: any | null } }> | null }, workspace?: { __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, snapshots: Array<{ __typename?: 'PadSnapshot', snapshotName: string, createdAt?: any | null, updatedAt?: any | null, data?: string | null, version?: string | null }> };

export type GetNotebookByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  snapshotName?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetNotebookByIdQuery = { __typename?: 'Query', getPadById?: { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, isPublic?: boolean | null, initialState?: string | null, access: { __typename?: 'PadAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user: { __typename?: 'User', id: string, image?: string | null, name: string, email?: string | null, username?: string | null, onboarded?: boolean | null, emailValidatedAt?: any | null } }> | null }, workspace?: { __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, snapshots: Array<{ __typename?: 'PadSnapshot', snapshotName: string, createdAt?: any | null, updatedAt?: any | null, data?: string | null, version?: string | null }> } | null };

export type UserQueryVariables = Exact<{ [key: string]: never; }>;


export type UserQuery = { __typename?: 'Query', selfFulfilledGoals: Array<string>, self?: { __typename?: 'User', id: string, name: string, username?: string | null, description?: string | null, hideChecklist?: boolean | null, onboarded?: boolean | null } | null };

export type WorkspaceSwitcherWorkspaceFragment = { __typename?: 'Workspace', id: string, name: string, myPermissionType?: PermissionType | null };

export type GetWorkspacesIDsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkspacesIDsQuery = { __typename?: 'Query', workspaces: Array<{ __typename?: 'Workspace', id: string, name: string, myPermissionType?: PermissionType | null }> };

export type WorkspaceNotebookFragment = { __typename?: 'Pad', id: string, name: string, icon?: string | null, status?: string | null, createdAt?: any | null, archived?: boolean | null, isPublic?: boolean | null, myPermissionType?: PermissionType | null, section?: { __typename?: 'Section', id: string, name: string } | null };

export type WorkspaceSectionFragment = { __typename?: 'Section', id: string, name: string, color: string, createdAt?: any | null, pads: Array<{ __typename?: 'Pad', id: string, name: string, icon?: string | null, status?: string | null, createdAt?: any | null, archived?: boolean | null, isPublic?: boolean | null, myPermissionType?: PermissionType | null, section?: { __typename?: 'Section', id: string, name: string } | null }> };

export type WorkspaceMembersFragment = { __typename?: 'Workspace', access?: { __typename?: 'WorkspaceAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user: { __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null, emailValidatedAt?: any | null } }> | null, roles?: Array<{ __typename?: 'RoleAccess', permission: PermissionType, role: { __typename?: 'Role', id: string, users: Array<{ __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null, emailValidatedAt?: any | null }> } }> | null } | null };

export type WorkspaceSubscriptionWithDataFragment = { __typename?: 'WorkspaceSubscription', paymentStatus?: SubscriptionPaymentStatus | null };

export type DashboardWorkspaceFragment = { __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null, membersCount: number, pads: { __typename?: 'PagedPadResult', items: Array<{ __typename?: 'Pad', id: string, name: string, icon?: string | null, status?: string | null, createdAt?: any | null, archived?: boolean | null, isPublic?: boolean | null, myPermissionType?: PermissionType | null, section?: { __typename?: 'Section', id: string, name: string } | null }> }, workspaceSubscription?: { __typename?: 'WorkspaceSubscription', paymentStatus?: SubscriptionPaymentStatus | null } | null, sections: Array<{ __typename?: 'Section', id: string, name: string, color: string, createdAt?: any | null, pads: Array<{ __typename?: 'Pad', id: string, name: string, icon?: string | null, status?: string | null, createdAt?: any | null, archived?: boolean | null, isPublic?: boolean | null, myPermissionType?: PermissionType | null, section?: { __typename?: 'Section', id: string, name: string } | null }> }>, access?: { __typename?: 'WorkspaceAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user: { __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null, emailValidatedAt?: any | null } }> | null, roles?: Array<{ __typename?: 'RoleAccess', permission: PermissionType, role: { __typename?: 'Role', id: string, users: Array<{ __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null, emailValidatedAt?: any | null }> } }> | null } | null };

export type GetWorkspacesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkspacesQuery = { __typename?: 'Query', workspaces: Array<{ __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null, membersCount: number, pads: { __typename?: 'PagedPadResult', items: Array<{ __typename?: 'Pad', id: string, name: string, icon?: string | null, status?: string | null, createdAt?: any | null, archived?: boolean | null, isPublic?: boolean | null, myPermissionType?: PermissionType | null, section?: { __typename?: 'Section', id: string, name: string } | null }> }, workspaceSubscription?: { __typename?: 'WorkspaceSubscription', paymentStatus?: SubscriptionPaymentStatus | null } | null, sections: Array<{ __typename?: 'Section', id: string, name: string, color: string, createdAt?: any | null, pads: Array<{ __typename?: 'Pad', id: string, name: string, icon?: string | null, status?: string | null, createdAt?: any | null, archived?: boolean | null, isPublic?: boolean | null, myPermissionType?: PermissionType | null, section?: { __typename?: 'Section', id: string, name: string } | null }> }>, access?: { __typename?: 'WorkspaceAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user: { __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null, emailValidatedAt?: any | null } }> | null, roles?: Array<{ __typename?: 'RoleAccess', permission: PermissionType, role: { __typename?: 'Role', id: string, users: Array<{ __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null, emailValidatedAt?: any | null }> } }> | null } | null }>, padsSharedWithMe: { __typename?: 'PagedPadResult', items: Array<{ __typename?: 'Pad', id: string, name: string, icon?: string | null, status?: string | null, createdAt?: any | null, archived?: boolean | null, isPublic?: boolean | null, myPermissionType?: PermissionType | null, section?: { __typename?: 'Section', id: string, name: string } | null }> } };

export type GetWorkspaceMembersQueryVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
}>;


export type GetWorkspaceMembersQuery = { __typename?: 'Query', getWorkspaceById?: { __typename?: 'Workspace', id: string, access?: { __typename?: 'WorkspaceAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user: { __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null, emailValidatedAt?: any | null } }> | null, roles?: Array<{ __typename?: 'RoleAccess', permission: PermissionType, role: { __typename?: 'Role', id: string, users: Array<{ __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null, emailValidatedAt?: any | null }> } }> | null } | null } | null };

export type GetWorkspaceSecretsQueryVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
}>;


export type GetWorkspaceSecretsQuery = { __typename?: 'Query', getWorkspaceSecrets: Array<{ __typename?: 'Secret', id: string, name: string }> };

export const ExternalDataSourceFragmentFragmentDoc = gql`
    fragment ExternalDataSourceFragment on ExternalDataSource {
  id
  name
  workspaceId
  padId
  provider
  dataUrl
  authUrl
  keys {
    lastError
    createdAt
    expiresAt
    lastUsedAt
  }
}
    `;
export const CollaboratorFragmentDoc = gql`
    fragment Collaborator on User {
  id
  image
  name
  email
  username
  onboarded
  emailValidatedAt
}
    `;
export const NotebookSnapshotFragmentDoc = gql`
    fragment NotebookSnapshot on PadSnapshot {
  snapshotName
  createdAt
  updatedAt
  data
  version
}
    `;
export const EditorNotebookFragmentDoc = gql`
    fragment EditorNotebook on Pad {
  id
  name
  myPermissionType
  icon
  isPublic
  access {
    users {
      user {
        ...Collaborator
      }
      permission
    }
  }
  workspace {
    id
    name
    isPremium
  }
  padConnectionParams {
    url
    token
  }
  initialState
  snapshots {
    ...NotebookSnapshot
  }
}
    ${CollaboratorFragmentDoc}
${NotebookSnapshotFragmentDoc}`;
export const WorkspaceSwitcherWorkspaceFragmentDoc = gql`
    fragment WorkspaceSwitcherWorkspace on Workspace {
  id
  name
  myPermissionType
}
    `;
export const WorkspaceNotebookFragmentDoc = gql`
    fragment WorkspaceNotebook on Pad {
  id
  name
  icon
  status
  createdAt
  archived
  isPublic
  section {
    id
    name
  }
  myPermissionType
}
    `;
export const WorkspaceSubscriptionWithDataFragmentDoc = gql`
    fragment WorkspaceSubscriptionWithData on WorkspaceSubscription {
  paymentStatus
}
    `;
export const WorkspaceSectionFragmentDoc = gql`
    fragment WorkspaceSection on Section {
  id
  name
  color
  pads {
    ...WorkspaceNotebook
  }
  createdAt
}
    ${WorkspaceNotebookFragmentDoc}`;
export const WorkspaceMembersFragmentDoc = gql`
    fragment WorkspaceMembers on Workspace {
  access {
    users {
      permission
      user {
        id
        name
        email
        image
        emailValidatedAt
      }
    }
    roles {
      permission
      role {
        id
        users {
          id
          name
          email
          image
          emailValidatedAt
        }
      }
    }
  }
}
    `;
export const DashboardWorkspaceFragmentDoc = gql`
    fragment DashboardWorkspace on Workspace {
  id
  name
  isPremium
  pads(page: {maxItems: 10000}) {
    items {
      ...WorkspaceNotebook
    }
  }
  workspaceSubscription {
    ...WorkspaceSubscriptionWithData
  }
  membersCount
  sections {
    ...WorkspaceSection
  }
  ...WorkspaceMembers
}
    ${WorkspaceNotebookFragmentDoc}
${WorkspaceSubscriptionWithDataFragmentDoc}
${WorkspaceSectionFragmentDoc}
${WorkspaceMembersFragmentDoc}`;
export const AttachFileToNotebookDocument = gql`
    mutation AttachFileToNotebook($handle: ID!) {
  attachFileToPad(handle: $handle) {
    url
  }
}
    `;

export function useAttachFileToNotebookMutation() {
  return Urql.useMutation<AttachFileToNotebookMutation, AttachFileToNotebookMutationVariables>(AttachFileToNotebookDocument);
};
export const ChangeWorkspaceAccessLevelDocument = gql`
    mutation ChangeWorkspaceAccessLevel($workspaceId: ID!, $email: String!, $permissionType: PermissionType!, $canComment: Boolean!) {
  shareWorkspaceWithEmail(
    id: $workspaceId
    email: $email
    permissionType: $permissionType
    canComment: $canComment
  ) {
    id
    ...WorkspaceMembers
  }
}
    ${WorkspaceMembersFragmentDoc}`;

export function useChangeWorkspaceAccessLevelMutation() {
  return Urql.useMutation<ChangeWorkspaceAccessLevelMutation, ChangeWorkspaceAccessLevelMutationVariables>(ChangeWorkspaceAccessLevelDocument);
};
export const CreateExternalDataSourceDocument = gql`
    mutation CreateExternalDataSource($dataSource: ExternalDataSourceCreateInput!) {
  createExternalDataSource(dataSource: $dataSource) {
    ...ExternalDataSourceFragment
  }
}
    ${ExternalDataSourceFragmentFragmentDoc}`;

export function useCreateExternalDataSourceMutation() {
  return Urql.useMutation<CreateExternalDataSourceMutation, CreateExternalDataSourceMutationVariables>(CreateExternalDataSourceDocument);
};
export const CreateLogsDocument = gql`
    mutation CreateLogs($resource: String!, $entries: [LogEntry!]!) {
  createLogs(input: {resource: $resource, entries: $entries})
}
    `;

export function useCreateLogsMutation() {
  return Urql.useMutation<CreateLogsMutation, CreateLogsMutationVariables>(CreateLogsDocument);
};
export const CreateNotebookDocument = gql`
    mutation CreateNotebook($workspaceId: ID!, $name: String!, $sectionId: ID) {
  createPad(workspaceId: $workspaceId, pad: {name: $name}, sectionId: $sectionId) {
    ...EditorNotebook
    ...WorkspaceNotebook
  }
}
    ${EditorNotebookFragmentDoc}
${WorkspaceNotebookFragmentDoc}`;

export function useCreateNotebookMutation() {
  return Urql.useMutation<CreateNotebookMutation, CreateNotebookMutationVariables>(CreateNotebookDocument);
};
export const CreateSectionDocument = gql`
    mutation CreateSection($workspaceId: ID!, $name: String!, $color: String!) {
  addSectionToWorkspace(
    workspaceId: $workspaceId
    section: {name: $name, color: $color}
  ) {
    id
    name
    color
    createdAt
  }
}
    `;

export function useCreateSectionMutation() {
  return Urql.useMutation<CreateSectionMutation, CreateSectionMutationVariables>(CreateSectionDocument);
};
export const CreateOrUpdateNotebookSnapshotDocument = gql`
    mutation CreateOrUpdateNotebookSnapshot($notebookId: ID!, $snapshotName: String!) {
  createOrUpdateSnapshot(notebookId: $notebookId, snapshotName: $snapshotName)
}
    `;

export function useCreateOrUpdateNotebookSnapshotMutation() {
  return Urql.useMutation<CreateOrUpdateNotebookSnapshotMutation, CreateOrUpdateNotebookSnapshotMutationVariables>(CreateOrUpdateNotebookSnapshotDocument);
};
export const CreateWorkspaceDocument = gql`
    mutation CreateWorkspace($name: String!) {
  createWorkspace(workspace: {name: $name}) {
    ...DashboardWorkspace
  }
}
    ${DashboardWorkspaceFragmentDoc}`;

export function useCreateWorkspaceMutation() {
  return Urql.useMutation<CreateWorkspaceMutation, CreateWorkspaceMutationVariables>(CreateWorkspaceDocument);
};
export const CreateWorkspaceSecretDocument = gql`
    mutation CreateWorkspaceSecret($workspaceId: ID!, $secret: SecretInput!) {
  createSecret(workspaceId: $workspaceId, secret: $secret) {
    id
    name
  }
}
    `;

export function useCreateWorkspaceSecretMutation() {
  return Urql.useMutation<CreateWorkspaceSecretMutation, CreateWorkspaceSecretMutationVariables>(CreateWorkspaceSecretDocument);
};
export const DeleteNotebookDocument = gql`
    mutation DeleteNotebook($id: ID!) {
  removePad(id: $id)
}
    `;

export function useDeleteNotebookMutation() {
  return Urql.useMutation<DeleteNotebookMutation, DeleteNotebookMutationVariables>(DeleteNotebookDocument);
};
export const DeleteSectionDocument = gql`
    mutation DeleteSection($workspaceId: ID!, $sectionId: ID!) {
  removeSectionFromWorkspace(workspaceId: $workspaceId, sectionId: $sectionId)
}
    `;

export function useDeleteSectionMutation() {
  return Urql.useMutation<DeleteSectionMutation, DeleteSectionMutationVariables>(DeleteSectionDocument);
};
export const DeleteWorkspaceDocument = gql`
    mutation DeleteWorkspace($id: ID!) {
  removeWorkspace(id: $id)
}
    `;

export function useDeleteWorkspaceMutation() {
  return Urql.useMutation<DeleteWorkspaceMutation, DeleteWorkspaceMutationVariables>(DeleteWorkspaceDocument);
};
export const DeleteWorkspaceSecretDocument = gql`
    mutation DeleteWorkspaceSecret($secretId: ID!) {
  removeSecret(secretId: $secretId)
}
    `;

export function useDeleteWorkspaceSecretMutation() {
  return Urql.useMutation<DeleteWorkspaceSecretMutation, DeleteWorkspaceSecretMutationVariables>(DeleteWorkspaceSecretDocument);
};
export const DuplicateNotebookDocument = gql`
    mutation DuplicateNotebook($id: ID!, $targetWorkspace: ID!, $document: String) {
  duplicatePad(id: $id, targetWorkspace: $targetWorkspace, document: $document) {
    ...EditorNotebook
    ...WorkspaceNotebook
  }
}
    ${EditorNotebookFragmentDoc}
${WorkspaceNotebookFragmentDoc}`;

export function useDuplicateNotebookMutation() {
  return Urql.useMutation<DuplicateNotebookMutation, DuplicateNotebookMutationVariables>(DuplicateNotebookDocument);
};
export const FulfilGoalDocument = gql`
    mutation FulfilGoal($props: GoalFulfilmentInput!) {
  fulfilGoal(props: $props)
}
    `;

export function useFulfilGoalMutation() {
  return Urql.useMutation<FulfilGoalMutation, FulfilGoalMutationVariables>(FulfilGoalDocument);
};
export const GetCreateAttachmentFormDocument = gql`
    mutation GetCreateAttachmentForm($notebookId: ID!, $fileName: String!, $fileType: String!) {
  getCreateAttachmentForm(
    padId: $notebookId
    fileName: $fileName
    fileType: $fileType
  ) {
    url
    handle
    fields {
      key
      value
    }
  }
}
    `;

export function useGetCreateAttachmentFormMutation() {
  return Urql.useMutation<GetCreateAttachmentFormMutation, GetCreateAttachmentFormMutationVariables>(GetCreateAttachmentFormDocument);
};
export const ImportNotebookDocument = gql`
    mutation ImportNotebook($workspaceId: ID!, $source: String!) {
  importPad(workspaceId: $workspaceId, source: $source) {
    ...EditorNotebook
    ...WorkspaceNotebook
  }
}
    ${EditorNotebookFragmentDoc}
${WorkspaceNotebookFragmentDoc}`;

export function useImportNotebookMutation() {
  return Urql.useMutation<ImportNotebookMutation, ImportNotebookMutationVariables>(ImportNotebookDocument);
};
export const MoveNotebookDocument = gql`
    mutation MoveNotebook($id: ID!, $workspaceId: ID!) {
  movePad(id: $id, workspaceId: $workspaceId) {
    ...EditorNotebook
    ...WorkspaceNotebook
  }
}
    ${EditorNotebookFragmentDoc}
${WorkspaceNotebookFragmentDoc}`;

export function useMoveNotebookMutation() {
  return Urql.useMutation<MoveNotebookMutation, MoveNotebookMutationVariables>(MoveNotebookDocument);
};
export const RenameNotebookDocument = gql`
    mutation RenameNotebook($id: ID!, $name: String!) {
  updatePad(id: $id, pad: {name: $name}) {
    id
    name
  }
}
    `;

export function useRenameNotebookMutation() {
  return Urql.useMutation<RenameNotebookMutation, RenameNotebookMutationVariables>(RenameNotebookDocument);
};
export const RenameWorkspaceDocument = gql`
    mutation RenameWorkspace($id: ID!, $name: String!) {
  updateWorkspace(id: $id, workspace: {name: $name}) {
    id
    name
  }
}
    `;

export function useRenameWorkspaceMutation() {
  return Urql.useMutation<RenameWorkspaceMutation, RenameWorkspaceMutationVariables>(RenameWorkspaceDocument);
};
export const SetNotebookPublicDocument = gql`
    mutation setNotebookPublic($id: ID!, $isPublic: Boolean!) {
  setPadPublic(id: $id, isPublic: $isPublic)
}
    `;

export function useSetNotebookPublicMutation() {
  return Urql.useMutation<SetNotebookPublicMutation, SetNotebookPublicMutationVariables>(SetNotebookPublicDocument);
};
export const SetUsernameDocument = gql`
    mutation SetUsername($props: UsernameInput!) {
  setUsername(props: $props)
}
    `;

export function useSetUsernameMutation() {
  return Urql.useMutation<SetUsernameMutation, SetUsernameMutationVariables>(SetUsernameDocument);
};
export const ShareNotebookWithSecretDocument = gql`
    mutation ShareNotebookWithSecret($id: ID!, $permissionType: PermissionType!, $canComment: Boolean!) {
  sharePadWithSecret(
    id: $id
    permissionType: $permissionType
    canComment: $canComment
  )
}
    `;

export function useShareNotebookWithSecretMutation() {
  return Urql.useMutation<ShareNotebookWithSecretMutation, ShareNotebookWithSecretMutationVariables>(ShareNotebookWithSecretDocument);
};
export const SharePadWithEmailDocument = gql`
    mutation sharePadWithEmail($padId: ID!, $email: String!, $permissionType: PermissionType!, $canComment: Boolean!) {
  sharePadWithEmail(
    id: $padId
    email: $email
    permissionType: $permissionType
    canComment: $canComment
  ) {
    id
    name
    access {
      users {
        permission
        canComment
        user {
          ...Collaborator
        }
      }
    }
  }
}
    ${CollaboratorFragmentDoc}`;

export function useSharePadWithEmailMutation() {
  return Urql.useMutation<SharePadWithEmailMutation, SharePadWithEmailMutationVariables>(SharePadWithEmailDocument);
};
export const ShareWorkspaceWithEmailDocument = gql`
    mutation ShareWorkspaceWithEmail($workspaceId: ID!, $email: String!, $permissionType: PermissionType!, $canComment: Boolean!) {
  shareWorkspaceWithEmail(
    id: $workspaceId
    email: $email
    permissionType: $permissionType
    canComment: $canComment
  ) {
    id
    ...WorkspaceMembers
  }
}
    ${WorkspaceMembersFragmentDoc}`;

export function useShareWorkspaceWithEmailMutation() {
  return Urql.useMutation<ShareWorkspaceWithEmailMutation, ShareWorkspaceWithEmailMutationVariables>(ShareWorkspaceWithEmailDocument);
};
export const UnarchiveNotebookDocument = gql`
    mutation UnarchiveNotebook($id: ID!) {
  updatePad(id: $id, pad: {archived: false}) {
    ...EditorNotebook
  }
}
    ${EditorNotebookFragmentDoc}`;

export function useUnarchiveNotebookMutation() {
  return Urql.useMutation<UnarchiveNotebookMutation, UnarchiveNotebookMutationVariables>(UnarchiveNotebookDocument);
};
export const UnshareNotebookWithSecretDocument = gql`
    mutation UnshareNotebookWithSecret($id: ID!, $secret: String!) {
  unshareNotebookWithSecret(id: $id, secret: $secret)
}
    `;

export function useUnshareNotebookWithSecretMutation() {
  return Urql.useMutation<UnshareNotebookWithSecretMutation, UnshareNotebookWithSecretMutationVariables>(UnshareNotebookWithSecretDocument);
};
export const UnsharePadWithUserDocument = gql`
    mutation unsharePadWithUser($padId: ID!, $userId: ID!) {
  unsharePadWithUser(id: $padId, userId: $userId) {
    id
    name
    access {
      users {
        permission
        canComment
        user {
          ...Collaborator
        }
      }
    }
  }
}
    ${CollaboratorFragmentDoc}`;

export function useUnsharePadWithUserMutation() {
  return Urql.useMutation<UnsharePadWithUserMutation, UnsharePadWithUserMutationVariables>(UnsharePadWithUserDocument);
};
export const UnshareWorkspaceWithUserDocument = gql`
    mutation UnshareWorkspaceWithUser($workspaceId: ID!, $userId: ID!) {
  unshareWorkspaceWithUser(id: $workspaceId, userId: $userId) {
    id
    ...WorkspaceMembers
  }
}
    ${WorkspaceMembersFragmentDoc}`;

export function useUnshareWorkspaceWithUserMutation() {
  return Urql.useMutation<UnshareWorkspaceWithUserMutation, UnshareWorkspaceWithUserMutationVariables>(UnshareWorkspaceWithUserDocument);
};
export const UpdateNotebookArchiveDocument = gql`
    mutation UpdateNotebookArchive($id: ID!) {
  updatePad(id: $id, pad: {archived: true}) {
    ...EditorNotebook
  }
}
    ${EditorNotebookFragmentDoc}`;

export function useUpdateNotebookArchiveMutation() {
  return Urql.useMutation<UpdateNotebookArchiveMutation, UpdateNotebookArchiveMutationVariables>(UpdateNotebookArchiveDocument);
};
export const UpdateNotebookIconDocument = gql`
    mutation UpdateNotebookIcon($id: ID!, $icon: String!) {
  updatePad(id: $id, pad: {icon: $icon}) {
    ...EditorNotebook
  }
}
    ${EditorNotebookFragmentDoc}`;

export function useUpdateNotebookIconMutation() {
  return Urql.useMutation<UpdateNotebookIconMutation, UpdateNotebookIconMutationVariables>(UpdateNotebookIconDocument);
};
export const UpdateNotebookStatusDocument = gql`
    mutation UpdateNotebookStatus($id: ID!, $status: String!) {
  updatePad(id: $id, pad: {status: $status}) {
    ...EditorNotebook
  }
}
    ${EditorNotebookFragmentDoc}`;

export function useUpdateNotebookStatusMutation() {
  return Urql.useMutation<UpdateNotebookStatusMutation, UpdateNotebookStatusMutationVariables>(UpdateNotebookStatusDocument);
};
export const UpdatePadPermissionDocument = gql`
    mutation updatePadPermission($padId: ID!, $userId: ID!, $permissionType: PermissionType!, $canComment: Boolean!) {
  unsharePadWithUser(id: $padId, userId: $userId) {
    id
    name
    access {
      users {
        permission
        canComment
        user {
          ...Collaborator
        }
      }
    }
  }
  sharePadWithUser(
    id: $padId
    userId: $userId
    permissionType: $permissionType
    canComment: $canComment
  ) {
    id
    name
    access {
      users {
        permission
        canComment
        user {
          ...Collaborator
        }
      }
    }
  }
}
    ${CollaboratorFragmentDoc}`;

export function useUpdatePadPermissionMutation() {
  return Urql.useMutation<UpdatePadPermissionMutation, UpdatePadPermissionMutationVariables>(UpdatePadPermissionDocument);
};
export const UpdateSectionDocument = gql`
    mutation UpdateSection($workspaceId: ID!, $sectionId: ID!, $name: String!, $color: String!) {
  updateSectionInWorkspace(
    workspaceId: $workspaceId
    sectionId: $sectionId
    section: {name: $name, color: $color}
  )
}
    `;

export function useUpdateSectionMutation() {
  return Urql.useMutation<UpdateSectionMutation, UpdateSectionMutationVariables>(UpdateSectionDocument);
};
export const UpdateSectionAddNotebookDocument = gql`
    mutation UpdateSectionAddNotebook($sectionId: ID!, $notebookId: ID!) {
  addNotebookToSection(sectionId: $sectionId, notebookId: $notebookId)
}
    `;

export function useUpdateSectionAddNotebookMutation() {
  return Urql.useMutation<UpdateSectionAddNotebookMutation, UpdateSectionAddNotebookMutationVariables>(UpdateSectionAddNotebookDocument);
};
export const UpdateUserDocument = gql`
    mutation UpdateUser($props: UserInput!) {
  updateSelf(props: $props) {
    name
    description
    hideChecklist
    onboarded
  }
}
    `;

export function useUpdateUserMutation() {
  return Urql.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(UpdateUserDocument);
};
export const GetExternalDataSourcesDocument = gql`
    query GetExternalDataSources($notebookId: ID!) {
  getExternalDataSources(notebookId: $notebookId, page: {maxItems: 10000}) {
    items {
      ...ExternalDataSourceFragment
    }
  }
}
    ${ExternalDataSourceFragmentFragmentDoc}`;

export function useGetExternalDataSourcesQuery(options: Omit<Urql.UseQueryArgs<GetExternalDataSourcesQueryVariables>, 'query'>) {
  return Urql.useQuery<GetExternalDataSourcesQuery, GetExternalDataSourcesQueryVariables>({ query: GetExternalDataSourcesDocument, ...options });
};
export const GetExternalDataSourcesWorkspaceDocument = gql`
    query GetExternalDataSourcesWorkspace($workspaceId: ID!) {
  getExternalDataSourcesWorkspace(
    workspaceId: $workspaceId
    page: {maxItems: 10000}
  ) {
    items {
      ...ExternalDataSourceFragment
    }
  }
}
    ${ExternalDataSourceFragmentFragmentDoc}`;

export function useGetExternalDataSourcesWorkspaceQuery(options: Omit<Urql.UseQueryArgs<GetExternalDataSourcesWorkspaceQueryVariables>, 'query'>) {
  return Urql.useQuery<GetExternalDataSourcesWorkspaceQuery, GetExternalDataSourcesWorkspaceQueryVariables>({ query: GetExternalDataSourcesWorkspaceDocument, ...options });
};
export const GetNotebookByIdDocument = gql`
    query GetNotebookById($id: ID!, $snapshotName: String) {
  getPadById(id: $id, snapshotName: $snapshotName) {
    ...EditorNotebook
  }
}
    ${EditorNotebookFragmentDoc}`;

export function useGetNotebookByIdQuery(options: Omit<Urql.UseQueryArgs<GetNotebookByIdQueryVariables>, 'query'>) {
  return Urql.useQuery<GetNotebookByIdQuery, GetNotebookByIdQueryVariables>({ query: GetNotebookByIdDocument, ...options });
};
export const UserDocument = gql`
    query User {
  self {
    id
    name
    username
    description
    hideChecklist
    onboarded
  }
  selfFulfilledGoals
}
    `;

export function useUserQuery(options?: Omit<Urql.UseQueryArgs<UserQueryVariables>, 'query'>) {
  return Urql.useQuery<UserQuery, UserQueryVariables>({ query: UserDocument, ...options });
};
export const GetWorkspacesIDsDocument = gql`
    query GetWorkspacesIDs {
  workspaces {
    ...WorkspaceSwitcherWorkspace
  }
}
    ${WorkspaceSwitcherWorkspaceFragmentDoc}`;

export function useGetWorkspacesIDsQuery(options?: Omit<Urql.UseQueryArgs<GetWorkspacesIDsQueryVariables>, 'query'>) {
  return Urql.useQuery<GetWorkspacesIDsQuery, GetWorkspacesIDsQueryVariables>({ query: GetWorkspacesIDsDocument, ...options });
};
export const GetWorkspacesDocument = gql`
    query GetWorkspaces {
  workspaces {
    ...DashboardWorkspace
  }
  padsSharedWithMe(page: {maxItems: 10000}) {
    items {
      ...WorkspaceNotebook
    }
  }
}
    ${DashboardWorkspaceFragmentDoc}
${WorkspaceNotebookFragmentDoc}`;

export function useGetWorkspacesQuery(options?: Omit<Urql.UseQueryArgs<GetWorkspacesQueryVariables>, 'query'>) {
  return Urql.useQuery<GetWorkspacesQuery, GetWorkspacesQueryVariables>({ query: GetWorkspacesDocument, ...options });
};
export const GetWorkspaceMembersDocument = gql`
    query GetWorkspaceMembers($workspaceId: ID!) {
  getWorkspaceById(id: $workspaceId) {
    id
    ...WorkspaceMembers
  }
}
    ${WorkspaceMembersFragmentDoc}`;

export function useGetWorkspaceMembersQuery(options: Omit<Urql.UseQueryArgs<GetWorkspaceMembersQueryVariables>, 'query'>) {
  return Urql.useQuery<GetWorkspaceMembersQuery, GetWorkspaceMembersQueryVariables>({ query: GetWorkspaceMembersDocument, ...options });
};
export const GetWorkspaceSecretsDocument = gql`
    query GetWorkspaceSecrets($workspaceId: ID!) {
  getWorkspaceSecrets(workspaceId: $workspaceId) {
    id
    name
  }
}
    `;

export function useGetWorkspaceSecretsQuery(options: Omit<Urql.UseQueryArgs<GetWorkspaceSecretsQueryVariables>, 'query'>) {
  return Urql.useQuery<GetWorkspaceSecretsQuery, GetWorkspaceSecretsQueryVariables>({ query: GetWorkspaceSecretsDocument, ...options });
};
export type WithTypename<T extends { __typename?: any }> = Partial<T> & { __typename: NonNullable<T['__typename']> };

export type GraphCacheKeysConfig = {
  Attachment?: (data: WithTypename<Attachment>) => null | string,
  CreateAttachmentForm?: (data: WithTypename<CreateAttachmentForm>) => null | string,
  ExternalDataSource?: (data: WithTypename<ExternalDataSource>) => null | string,
  ExternalDataSourceAccess?: (data: WithTypename<ExternalDataSourceAccess>) => null | string,
  ExternalKey?: (data: WithTypename<ExternalKey>) => null | string,
  KeyValue?: (data: WithTypename<KeyValue>) => null | string,
  Pad?: (data: WithTypename<Pad>) => null | string,
  PadAccess?: (data: WithTypename<PadAccess>) => null | string,
  PadChanges?: (data: WithTypename<PadChanges>) => null | string,
  PadConnectionParams?: (data: WithTypename<PadConnectionParams>) => null | string,
  PadSnapshot?: (data: WithTypename<PadSnapshot>) => null | string,
  PagedPadResult?: (data: WithTypename<PagedPadResult>) => null | string,
  PagedResult?: (data: WithTypename<PagedResult>) => null | string,
  Permission?: (data: WithTypename<Permission>) => null | string,
  Role?: (data: WithTypename<Role>) => null | string,
  RoleAccess?: (data: WithTypename<RoleAccess>) => null | string,
  RoleInvitation?: (data: WithTypename<RoleInvitation>) => null | string,
  Secret?: (data: WithTypename<Secret>) => null | string,
  SecretAccess?: (data: WithTypename<SecretAccess>) => null | string,
  Section?: (data: WithTypename<Section>) => null | string,
  SectionChanges?: (data: WithTypename<SectionChanges>) => null | string,
  ShareInvitation?: (data: WithTypename<ShareInvitation>) => null | string,
  SharedResource?: (data: WithTypename<SharedResource>) => null | string,
  SharedWith?: (data: WithTypename<SharedWith>) => null | string,
  SharedWithRole?: (data: WithTypename<SharedWithRole>) => null | string,
  SharedWithUser?: (data: WithTypename<SharedWithUser>) => null | string,
  TagChanges?: (data: WithTypename<TagChanges>) => null | string,
  TagRecord?: (data: WithTypename<TagRecord>) => null | string,
  User?: (data: WithTypename<User>) => null | string,
  UserAccess?: (data: WithTypename<UserAccess>) => null | string,
  Workspace?: (data: WithTypename<Workspace>) => null | string,
  WorkspaceAccess?: (data: WithTypename<WorkspaceAccess>) => null | string,
  WorkspaceSubscription?: (data: WithTypename<WorkspaceSubscription>) => null | string,
  WorkspacesChanges?: (data: WithTypename<WorkspacesChanges>) => null | string
}

export type GraphCacheResolvers = {
  Query?: {
    featuredPad?: GraphCacheResolver<WithTypename<Query>, Record<string, never>, WithTypename<Pad> | string>,
    getExternalDataSource?: GraphCacheResolver<WithTypename<Query>, QueryGetExternalDataSourceArgs, WithTypename<ExternalDataSource> | string>,
    getExternalDataSources?: GraphCacheResolver<WithTypename<Query>, QueryGetExternalDataSourcesArgs, WithTypename<PagedResult> | string>,
    getExternalDataSourcesWorkspace?: GraphCacheResolver<WithTypename<Query>, QueryGetExternalDataSourcesWorkspaceArgs, WithTypename<PagedResult> | string>,
    getPadById?: GraphCacheResolver<WithTypename<Query>, QueryGetPadByIdArgs, WithTypename<Pad> | string>,
    getWorkspaceById?: GraphCacheResolver<WithTypename<Query>, QueryGetWorkspaceByIdArgs, WithTypename<Workspace> | string>,
    getWorkspaceSecrets?: GraphCacheResolver<WithTypename<Query>, QueryGetWorkspaceSecretsArgs, Array<WithTypename<Secret> | string>>,
    me?: GraphCacheResolver<WithTypename<Query>, Record<string, never>, WithTypename<User> | string>,
    pads?: GraphCacheResolver<WithTypename<Query>, QueryPadsArgs, WithTypename<PagedPadResult> | string>,
    padsByTag?: GraphCacheResolver<WithTypename<Query>, QueryPadsByTagArgs, WithTypename<PagedPadResult> | string>,
    padsSharedWithMe?: GraphCacheResolver<WithTypename<Query>, QueryPadsSharedWithMeArgs, WithTypename<PagedPadResult> | string>,
    sections?: GraphCacheResolver<WithTypename<Query>, QuerySectionsArgs, Array<WithTypename<Section> | string>>,
    self?: GraphCacheResolver<WithTypename<Query>, Record<string, never>, WithTypename<User> | string>,
    selfFulfilledGoals?: GraphCacheResolver<WithTypename<Query>, Record<string, never>, Array<Scalars['String'] | string>>,
    tags?: GraphCacheResolver<WithTypename<Query>, QueryTagsArgs, Array<Scalars['String'] | string>>,
    version?: GraphCacheResolver<WithTypename<Query>, Record<string, never>, Scalars['String'] | string>,
    workspaces?: GraphCacheResolver<WithTypename<Query>, Record<string, never>, Array<WithTypename<Workspace> | string>>
  },
  Attachment?: {
    createdAt?: GraphCacheResolver<WithTypename<Attachment>, Record<string, never>, Scalars['DateTime'] | string>,
    fileName?: GraphCacheResolver<WithTypename<Attachment>, Record<string, never>, Scalars['String'] | string>,
    fileSize?: GraphCacheResolver<WithTypename<Attachment>, Record<string, never>, Scalars['Int'] | string>,
    fileType?: GraphCacheResolver<WithTypename<Attachment>, Record<string, never>, Scalars['String'] | string>,
    id?: GraphCacheResolver<WithTypename<Attachment>, Record<string, never>, Scalars['ID'] | string>,
    pad?: GraphCacheResolver<WithTypename<Attachment>, Record<string, never>, WithTypename<Pad> | string>,
    uploadedBy?: GraphCacheResolver<WithTypename<Attachment>, Record<string, never>, WithTypename<User> | string>,
    url?: GraphCacheResolver<WithTypename<Attachment>, Record<string, never>, Scalars['String'] | string>
  },
  CreateAttachmentForm?: {
    fields?: GraphCacheResolver<WithTypename<CreateAttachmentForm>, Record<string, never>, Array<WithTypename<KeyValue> | string>>,
    handle?: GraphCacheResolver<WithTypename<CreateAttachmentForm>, Record<string, never>, Scalars['String'] | string>,
    url?: GraphCacheResolver<WithTypename<CreateAttachmentForm>, Record<string, never>, Scalars['String'] | string>
  },
  ExternalDataSource?: {
    access?: GraphCacheResolver<WithTypename<ExternalDataSource>, Record<string, never>, WithTypename<ExternalDataSourceAccess> | string>,
    authUrl?: GraphCacheResolver<WithTypename<ExternalDataSource>, Record<string, never>, Scalars['String'] | string>,
    dataUrl?: GraphCacheResolver<WithTypename<ExternalDataSource>, Record<string, never>, Scalars['String'] | string>,
    id?: GraphCacheResolver<WithTypename<ExternalDataSource>, Record<string, never>, Scalars['ID'] | string>,
    keys?: GraphCacheResolver<WithTypename<ExternalDataSource>, Record<string, never>, Array<WithTypename<ExternalKey> | string>>,
    name?: GraphCacheResolver<WithTypename<ExternalDataSource>, Record<string, never>, Scalars['String'] | string>,
    padId?: GraphCacheResolver<WithTypename<ExternalDataSource>, Record<string, never>, Scalars['ID'] | string>,
    provider?: GraphCacheResolver<WithTypename<ExternalDataSource>, Record<string, never>, ExternalProvider | string>,
    workspaceId?: GraphCacheResolver<WithTypename<ExternalDataSource>, Record<string, never>, Scalars['ID'] | string>
  },
  ExternalDataSourceAccess?: {
    roles?: GraphCacheResolver<WithTypename<ExternalDataSourceAccess>, Record<string, never>, Array<WithTypename<RoleAccess> | string>>,
    users?: GraphCacheResolver<WithTypename<ExternalDataSourceAccess>, Record<string, never>, Array<WithTypename<UserAccess> | string>>
  },
  ExternalKey?: {
    createdAt?: GraphCacheResolver<WithTypename<ExternalKey>, Record<string, never>, Scalars['DateTime'] | string>,
    expiresAt?: GraphCacheResolver<WithTypename<ExternalKey>, Record<string, never>, Scalars['DateTime'] | string>,
    id?: GraphCacheResolver<WithTypename<ExternalKey>, Record<string, never>, Scalars['ID'] | string>,
    lastError?: GraphCacheResolver<WithTypename<ExternalKey>, Record<string, never>, Scalars['String'] | string>,
    lastUsedAt?: GraphCacheResolver<WithTypename<ExternalKey>, Record<string, never>, Scalars['DateTime'] | string>
  },
  KeyValue?: {
    key?: GraphCacheResolver<WithTypename<KeyValue>, Record<string, never>, Scalars['String'] | string>,
    value?: GraphCacheResolver<WithTypename<KeyValue>, Record<string, never>, Scalars['String'] | string>
  },
  Pad?: {
    access?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, WithTypename<PadAccess> | string>,
    archived?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Scalars['Boolean'] | string>,
    attachments?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Array<WithTypename<Attachment> | string>>,
    createdAt?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Scalars['DateTime'] | string>,
    icon?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Scalars['String'] | string>,
    id?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Scalars['ID'] | string>,
    initialState?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Scalars['String'] | string>,
    isPublic?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Scalars['Boolean'] | string>,
    myPermissionType?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, PermissionType | string>,
    name?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Scalars['String'] | string>,
    padConnectionParams?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, WithTypename<PadConnectionParams> | string>,
    section?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, WithTypename<Section> | string>,
    snapshots?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Array<WithTypename<PadSnapshot> | string>>,
    status?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Scalars['String'] | string>,
    tags?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Array<Scalars['String'] | string>>,
    workspace?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, WithTypename<Workspace> | string>
  },
  PadAccess?: {
    roles?: GraphCacheResolver<WithTypename<PadAccess>, Record<string, never>, Array<WithTypename<RoleAccess> | string>>,
    secrets?: GraphCacheResolver<WithTypename<PadAccess>, Record<string, never>, Array<WithTypename<SecretAccess> | string>>,
    users?: GraphCacheResolver<WithTypename<PadAccess>, Record<string, never>, Array<WithTypename<UserAccess> | string>>
  },
  PadChanges?: {
    added?: GraphCacheResolver<WithTypename<PadChanges>, Record<string, never>, Array<WithTypename<Pad> | string>>,
    removed?: GraphCacheResolver<WithTypename<PadChanges>, Record<string, never>, Array<Scalars['ID'] | string>>,
    updated?: GraphCacheResolver<WithTypename<PadChanges>, Record<string, never>, Array<WithTypename<Pad> | string>>
  },
  PadConnectionParams?: {
    token?: GraphCacheResolver<WithTypename<PadConnectionParams>, Record<string, never>, Scalars['String'] | string>,
    url?: GraphCacheResolver<WithTypename<PadConnectionParams>, Record<string, never>, Scalars['String'] | string>
  },
  PadSnapshot?: {
    createdAt?: GraphCacheResolver<WithTypename<PadSnapshot>, Record<string, never>, Scalars['DateTime'] | string>,
    data?: GraphCacheResolver<WithTypename<PadSnapshot>, Record<string, never>, Scalars['String'] | string>,
    snapshotName?: GraphCacheResolver<WithTypename<PadSnapshot>, Record<string, never>, Scalars['String'] | string>,
    updatedAt?: GraphCacheResolver<WithTypename<PadSnapshot>, Record<string, never>, Scalars['DateTime'] | string>,
    version?: GraphCacheResolver<WithTypename<PadSnapshot>, Record<string, never>, Scalars['String'] | string>
  },
  PagedPadResult?: {
    count?: GraphCacheResolver<WithTypename<PagedPadResult>, Record<string, never>, Scalars['Int'] | string>,
    cursor?: GraphCacheResolver<WithTypename<PagedPadResult>, Record<string, never>, Scalars['String'] | string>,
    hasNextPage?: GraphCacheResolver<WithTypename<PagedPadResult>, Record<string, never>, Scalars['Boolean'] | string>,
    items?: GraphCacheResolver<WithTypename<PagedPadResult>, Record<string, never>, Array<WithTypename<Pad> | string>>
  },
  PagedResult?: {
    count?: GraphCacheResolver<WithTypename<PagedResult>, Record<string, never>, Scalars['Int'] | string>,
    cursor?: GraphCacheResolver<WithTypename<PagedResult>, Record<string, never>, Scalars['String'] | string>,
    hasNextPage?: GraphCacheResolver<WithTypename<PagedResult>, Record<string, never>, Scalars['Boolean'] | string>,
    items?: GraphCacheResolver<WithTypename<PagedResult>, Record<string, never>, Array<WithTypename<Pageable> | string>>
  },
  Permission?: {
    canComment?: GraphCacheResolver<WithTypename<Permission>, Record<string, never>, Scalars['Boolean'] | string>,
    createdAt?: GraphCacheResolver<WithTypename<Permission>, Record<string, never>, Scalars['DateTime'] | string>,
    givenBy?: GraphCacheResolver<WithTypename<Permission>, Record<string, never>, WithTypename<User> | string>,
    id?: GraphCacheResolver<WithTypename<Permission>, Record<string, never>, Scalars['ID'] | string>,
    resource?: GraphCacheResolver<WithTypename<Permission>, Record<string, never>, Scalars['String'] | string>,
    type?: GraphCacheResolver<WithTypename<Permission>, Record<string, never>, PermissionType | string>,
    user?: GraphCacheResolver<WithTypename<Permission>, Record<string, never>, WithTypename<User> | string>
  },
  Role?: {
    createdAt?: GraphCacheResolver<WithTypename<Role>, Record<string, never>, Scalars['DateTime'] | string>,
    id?: GraphCacheResolver<WithTypename<Role>, Record<string, never>, Scalars['ID'] | string>,
    name?: GraphCacheResolver<WithTypename<Role>, Record<string, never>, Scalars['String'] | string>,
    users?: GraphCacheResolver<WithTypename<Role>, Record<string, never>, Array<WithTypename<User> | string>>,
    workspace?: GraphCacheResolver<WithTypename<Role>, Record<string, never>, WithTypename<Workspace> | string>
  },
  RoleAccess?: {
    canComment?: GraphCacheResolver<WithTypename<RoleAccess>, Record<string, never>, Scalars['Boolean'] | string>,
    permission?: GraphCacheResolver<WithTypename<RoleAccess>, Record<string, never>, PermissionType | string>,
    role?: GraphCacheResolver<WithTypename<RoleAccess>, Record<string, never>, WithTypename<Role> | string>
  },
  RoleInvitation?: {
    expires_at?: GraphCacheResolver<WithTypename<RoleInvitation>, Record<string, never>, Scalars['DateTime'] | string>,
    id?: GraphCacheResolver<WithTypename<RoleInvitation>, Record<string, never>, Scalars['ID'] | string>,
    role?: GraphCacheResolver<WithTypename<RoleInvitation>, Record<string, never>, WithTypename<Role> | string>,
    user?: GraphCacheResolver<WithTypename<RoleInvitation>, Record<string, never>, WithTypename<User> | string>
  },
  Secret?: {
    id?: GraphCacheResolver<WithTypename<Secret>, Record<string, never>, Scalars['ID'] | string>,
    name?: GraphCacheResolver<WithTypename<Secret>, Record<string, never>, Scalars['String'] | string>,
    workspace?: GraphCacheResolver<WithTypename<Secret>, Record<string, never>, WithTypename<Workspace> | string>
  },
  SecretAccess?: {
    canComment?: GraphCacheResolver<WithTypename<SecretAccess>, Record<string, never>, Scalars['Boolean'] | string>,
    permission?: GraphCacheResolver<WithTypename<SecretAccess>, Record<string, never>, PermissionType | string>,
    secret?: GraphCacheResolver<WithTypename<SecretAccess>, Record<string, never>, Scalars['String'] | string>
  },
  Section?: {
    color?: GraphCacheResolver<WithTypename<Section>, Record<string, never>, Scalars['String'] | string>,
    createdAt?: GraphCacheResolver<WithTypename<Section>, Record<string, never>, Scalars['DateTime'] | string>,
    id?: GraphCacheResolver<WithTypename<Section>, Record<string, never>, Scalars['ID'] | string>,
    name?: GraphCacheResolver<WithTypename<Section>, Record<string, never>, Scalars['String'] | string>,
    pads?: GraphCacheResolver<WithTypename<Section>, Record<string, never>, Array<WithTypename<Pad> | string>>,
    workspace_id?: GraphCacheResolver<WithTypename<Section>, Record<string, never>, Scalars['ID'] | string>
  },
  SectionChanges?: {
    added?: GraphCacheResolver<WithTypename<SectionChanges>, Record<string, never>, Array<WithTypename<Section> | string>>,
    removed?: GraphCacheResolver<WithTypename<SectionChanges>, Record<string, never>, Array<Scalars['ID'] | string>>,
    updated?: GraphCacheResolver<WithTypename<SectionChanges>, Record<string, never>, Array<WithTypename<Section> | string>>
  },
  ShareInvitation?: {
    email?: GraphCacheResolver<WithTypename<ShareInvitation>, Record<string, never>, Scalars['String'] | string>
  },
  SharedResource?: {
    canComment?: GraphCacheResolver<WithTypename<SharedResource>, Record<string, never>, Scalars['Boolean'] | string>,
    permission?: GraphCacheResolver<WithTypename<SharedResource>, Record<string, never>, PermissionType | string>,
    resource?: GraphCacheResolver<WithTypename<SharedResource>, Record<string, never>, Scalars['String'] | string>
  },
  SharedWith?: {
    pendingInvitations?: GraphCacheResolver<WithTypename<SharedWith>, Record<string, never>, Array<WithTypename<ShareInvitation> | string>>,
    roles?: GraphCacheResolver<WithTypename<SharedWith>, Record<string, never>, Array<WithTypename<SharedWithRole> | string>>,
    users?: GraphCacheResolver<WithTypename<SharedWith>, Record<string, never>, Array<WithTypename<SharedWithUser> | string>>
  },
  SharedWithRole?: {
    canComment?: GraphCacheResolver<WithTypename<SharedWithRole>, Record<string, never>, Scalars['Boolean'] | string>,
    permissionType?: GraphCacheResolver<WithTypename<SharedWithRole>, Record<string, never>, PermissionType | string>,
    role?: GraphCacheResolver<WithTypename<SharedWithRole>, Record<string, never>, WithTypename<Role> | string>
  },
  SharedWithUser?: {
    canComment?: GraphCacheResolver<WithTypename<SharedWithUser>, Record<string, never>, Scalars['Boolean'] | string>,
    permissionType?: GraphCacheResolver<WithTypename<SharedWithUser>, Record<string, never>, PermissionType | string>,
    user?: GraphCacheResolver<WithTypename<SharedWithUser>, Record<string, never>, WithTypename<User> | string>
  },
  TagChanges?: {
    added?: GraphCacheResolver<WithTypename<TagChanges>, Record<string, never>, Array<WithTypename<TagRecord> | string>>,
    removed?: GraphCacheResolver<WithTypename<TagChanges>, Record<string, never>, Array<WithTypename<TagRecord> | string>>
  },
  TagRecord?: {
    tag?: GraphCacheResolver<WithTypename<TagRecord>, Record<string, never>, Scalars['String'] | string>,
    workspaceId?: GraphCacheResolver<WithTypename<TagRecord>, Record<string, never>, Scalars['ID'] | string>
  },
  User?: {
    createdAt?: GraphCacheResolver<WithTypename<User>, Record<string, never>, Scalars['DateTime'] | string>,
    description?: GraphCacheResolver<WithTypename<User>, Record<string, never>, Scalars['String'] | string>,
    email?: GraphCacheResolver<WithTypename<User>, Record<string, never>, Scalars['String'] | string>,
    emailValidatedAt?: GraphCacheResolver<WithTypename<User>, Record<string, never>, Scalars['DateTime'] | string>,
    hideChecklist?: GraphCacheResolver<WithTypename<User>, Record<string, never>, Scalars['Boolean'] | string>,
    id?: GraphCacheResolver<WithTypename<User>, Record<string, never>, Scalars['ID'] | string>,
    image?: GraphCacheResolver<WithTypename<User>, Record<string, never>, Scalars['String'] | string>,
    name?: GraphCacheResolver<WithTypename<User>, Record<string, never>, Scalars['String'] | string>,
    onboarded?: GraphCacheResolver<WithTypename<User>, Record<string, never>, Scalars['Boolean'] | string>,
    username?: GraphCacheResolver<WithTypename<User>, Record<string, never>, Scalars['String'] | string>
  },
  UserAccess?: {
    canComment?: GraphCacheResolver<WithTypename<UserAccess>, Record<string, never>, Scalars['Boolean'] | string>,
    permission?: GraphCacheResolver<WithTypename<UserAccess>, Record<string, never>, PermissionType | string>,
    user?: GraphCacheResolver<WithTypename<UserAccess>, Record<string, never>, WithTypename<User> | string>
  },
  Workspace?: {
    access?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, WithTypename<WorkspaceAccess> | string>,
    createdAt?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, Scalars['DateTime'] | string>,
    id?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, Scalars['ID'] | string>,
    isPremium?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, Scalars['Boolean'] | string>,
    isPublic?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, Scalars['Boolean'] | string>,
    membersCount?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, Scalars['Int'] | string>,
    myPermissionType?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, PermissionType | string>,
    name?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, Scalars['String'] | string>,
    pads?: GraphCacheResolver<WithTypename<Workspace>, WorkspacePadsArgs, WithTypename<PagedPadResult> | string>,
    roles?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, Array<WithTypename<Role> | string>>,
    secrets?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, Array<WithTypename<Secret> | string>>,
    sections?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, Array<WithTypename<Section> | string>>,
    workspaceSubscription?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, WithTypename<WorkspaceSubscription> | string>
  },
  WorkspaceAccess?: {
    roles?: GraphCacheResolver<WithTypename<WorkspaceAccess>, Record<string, never>, Array<WithTypename<RoleAccess> | string>>,
    users?: GraphCacheResolver<WithTypename<WorkspaceAccess>, Record<string, never>, Array<WithTypename<UserAccess> | string>>
  },
  WorkspaceSubscription?: {
    customer_id?: GraphCacheResolver<WithTypename<WorkspaceSubscription>, Record<string, never>, Scalars['String'] | string>,
    id?: GraphCacheResolver<WithTypename<WorkspaceSubscription>, Record<string, never>, Scalars['String'] | string>,
    paymentLink?: GraphCacheResolver<WithTypename<WorkspaceSubscription>, Record<string, never>, Scalars['String'] | string>,
    paymentStatus?: GraphCacheResolver<WithTypename<WorkspaceSubscription>, Record<string, never>, SubscriptionPaymentStatus | string>,
    seats?: GraphCacheResolver<WithTypename<WorkspaceSubscription>, Record<string, never>, Scalars['Int'] | string>,
    status?: GraphCacheResolver<WithTypename<WorkspaceSubscription>, Record<string, never>, SubscriptionStatus | string>,
    workspace?: GraphCacheResolver<WithTypename<WorkspaceSubscription>, Record<string, never>, WithTypename<Workspace> | string>
  },
  WorkspacesChanges?: {
    added?: GraphCacheResolver<WithTypename<WorkspacesChanges>, Record<string, never>, Array<WithTypename<Workspace> | string>>,
    removed?: GraphCacheResolver<WithTypename<WorkspacesChanges>, Record<string, never>, Array<Scalars['ID'] | string>>,
    updated?: GraphCacheResolver<WithTypename<WorkspacesChanges>, Record<string, never>, Array<WithTypename<Workspace> | string>>
  }
};

export type GraphCacheOptimisticUpdaters = {
  addNotebookToSection?: GraphCacheOptimisticMutationResolver<MutationAddNotebookToSectionArgs, Maybe<Scalars['Boolean']>>,
  addSectionToWorkspace?: GraphCacheOptimisticMutationResolver<MutationAddSectionToWorkspaceArgs, Maybe<WithTypename<Section>>>,
  addTagToPad?: GraphCacheOptimisticMutationResolver<MutationAddTagToPadArgs, Maybe<Scalars['Boolean']>>,
  attachFileToPad?: GraphCacheOptimisticMutationResolver<MutationAttachFileToPadArgs, Maybe<WithTypename<Attachment>>>,
  createExternalDataSource?: GraphCacheOptimisticMutationResolver<MutationCreateExternalDataSourceArgs, Maybe<WithTypename<ExternalDataSource>>>,
  createLogs?: GraphCacheOptimisticMutationResolver<MutationCreateLogsArgs, Maybe<Scalars['Boolean']>>,
  createOrUpdateSnapshot?: GraphCacheOptimisticMutationResolver<MutationCreateOrUpdateSnapshotArgs, Scalars['Boolean']>,
  createPad?: GraphCacheOptimisticMutationResolver<MutationCreatePadArgs, WithTypename<Pad>>,
  createRole?: GraphCacheOptimisticMutationResolver<MutationCreateRoleArgs, WithTypename<Role>>,
  createSecret?: GraphCacheOptimisticMutationResolver<MutationCreateSecretArgs, WithTypename<Secret>>,
  createUserViaMagicLink?: GraphCacheOptimisticMutationResolver<MutationCreateUserViaMagicLinkArgs, WithTypename<User>>,
  createWorkspace?: GraphCacheOptimisticMutationResolver<MutationCreateWorkspaceArgs, WithTypename<Workspace>>,
  doNothing?: GraphCacheOptimisticMutationResolver<Record<string, never>, Maybe<Scalars['Boolean']>>,
  duplicatePad?: GraphCacheOptimisticMutationResolver<MutationDuplicatePadArgs, WithTypename<Pad>>,
  fulfilGoal?: GraphCacheOptimisticMutationResolver<MutationFulfilGoalArgs, Scalars['Boolean']>,
  getCreateAttachmentForm?: GraphCacheOptimisticMutationResolver<MutationGetCreateAttachmentFormArgs, WithTypename<CreateAttachmentForm>>,
  importPad?: GraphCacheOptimisticMutationResolver<MutationImportPadArgs, WithTypename<Pad>>,
  inviteUserToRole?: GraphCacheOptimisticMutationResolver<MutationInviteUserToRoleArgs, Array<WithTypename<RoleInvitation>>>,
  movePad?: GraphCacheOptimisticMutationResolver<MutationMovePadArgs, WithTypename<Pad>>,
  pretendUser?: GraphCacheOptimisticMutationResolver<MutationPretendUserArgs, Maybe<Scalars['Boolean']>>,
  removeAttachmentFromPad?: GraphCacheOptimisticMutationResolver<MutationRemoveAttachmentFromPadArgs, Maybe<Scalars['Boolean']>>,
  removeExternalDataSource?: GraphCacheOptimisticMutationResolver<MutationRemoveExternalDataSourceArgs, Maybe<Scalars['Boolean']>>,
  removePad?: GraphCacheOptimisticMutationResolver<MutationRemovePadArgs, Maybe<Scalars['Boolean']>>,
  removeRole?: GraphCacheOptimisticMutationResolver<MutationRemoveRoleArgs, Maybe<Scalars['Boolean']>>,
  removeSecret?: GraphCacheOptimisticMutationResolver<MutationRemoveSecretArgs, Scalars['Boolean']>,
  removeSectionFromWorkspace?: GraphCacheOptimisticMutationResolver<MutationRemoveSectionFromWorkspaceArgs, Maybe<Scalars['Boolean']>>,
  removeSelfFromRole?: GraphCacheOptimisticMutationResolver<MutationRemoveSelfFromRoleArgs, Maybe<Scalars['Boolean']>>,
  removeTagFromPad?: GraphCacheOptimisticMutationResolver<MutationRemoveTagFromPadArgs, Maybe<Scalars['Boolean']>>,
  removeUserFromRole?: GraphCacheOptimisticMutationResolver<MutationRemoveUserFromRoleArgs, Maybe<Scalars['Boolean']>>,
  removeWorkspace?: GraphCacheOptimisticMutationResolver<MutationRemoveWorkspaceArgs, Maybe<Scalars['Boolean']>>,
  resendRegistrationMagicLinkEmail?: GraphCacheOptimisticMutationResolver<MutationResendRegistrationMagicLinkEmailArgs, Maybe<Scalars['Boolean']>>,
  setPadPublic?: GraphCacheOptimisticMutationResolver<MutationSetPadPublicArgs, Scalars['Boolean']>,
  setUsername?: GraphCacheOptimisticMutationResolver<MutationSetUsernameArgs, Scalars['Boolean']>,
  shareExternalDataSourceWithEmail?: GraphCacheOptimisticMutationResolver<MutationShareExternalDataSourceWithEmailArgs, Maybe<WithTypename<ExternalDataSource>>>,
  shareExternalDataSourceWithRole?: GraphCacheOptimisticMutationResolver<MutationShareExternalDataSourceWithRoleArgs, Maybe<Scalars['Boolean']>>,
  shareExternalDataSourceWithUser?: GraphCacheOptimisticMutationResolver<MutationShareExternalDataSourceWithUserArgs, Maybe<WithTypename<ExternalDataSource>>>,
  sharePadWithEmail?: GraphCacheOptimisticMutationResolver<MutationSharePadWithEmailArgs, WithTypename<Pad>>,
  sharePadWithRole?: GraphCacheOptimisticMutationResolver<MutationSharePadWithRoleArgs, Maybe<Scalars['Boolean']>>,
  sharePadWithSecret?: GraphCacheOptimisticMutationResolver<MutationSharePadWithSecretArgs, Scalars['String']>,
  sharePadWithUser?: GraphCacheOptimisticMutationResolver<MutationSharePadWithUserArgs, Maybe<WithTypename<Pad>>>,
  shareWorkspaceWithEmail?: GraphCacheOptimisticMutationResolver<MutationShareWorkspaceWithEmailArgs, WithTypename<Workspace>>,
  syncWorkspaceSeats?: GraphCacheOptimisticMutationResolver<MutationSyncWorkspaceSeatsArgs, WithTypename<WorkspaceSubscription>>,
  unshareExternalDataSourceWithRole?: GraphCacheOptimisticMutationResolver<MutationUnshareExternalDataSourceWithRoleArgs, Maybe<Scalars['Boolean']>>,
  unshareExternalDataSourceWithUser?: GraphCacheOptimisticMutationResolver<MutationUnshareExternalDataSourceWithUserArgs, WithTypename<ExternalDataSource>>,
  unshareNotebookWithSecret?: GraphCacheOptimisticMutationResolver<MutationUnshareNotebookWithSecretArgs, Maybe<Scalars['Boolean']>>,
  unsharePadWithRole?: GraphCacheOptimisticMutationResolver<MutationUnsharePadWithRoleArgs, Maybe<Scalars['Boolean']>>,
  unsharePadWithUser?: GraphCacheOptimisticMutationResolver<MutationUnsharePadWithUserArgs, Maybe<WithTypename<Pad>>>,
  unshareWorkspaceWithUser?: GraphCacheOptimisticMutationResolver<MutationUnshareWorkspaceWithUserArgs, Maybe<WithTypename<Workspace>>>,
  updateExternalDataSource?: GraphCacheOptimisticMutationResolver<MutationUpdateExternalDataSourceArgs, Maybe<WithTypename<ExternalDataSource>>>,
  updatePad?: GraphCacheOptimisticMutationResolver<MutationUpdatePadArgs, WithTypename<Pad>>,
  updateSecret?: GraphCacheOptimisticMutationResolver<MutationUpdateSecretArgs, WithTypename<Secret>>,
  updateSectionInWorkspace?: GraphCacheOptimisticMutationResolver<MutationUpdateSectionInWorkspaceArgs, Maybe<Scalars['Boolean']>>,
  updateSelf?: GraphCacheOptimisticMutationResolver<MutationUpdateSelfArgs, WithTypename<User>>,
  updateWorkspace?: GraphCacheOptimisticMutationResolver<MutationUpdateWorkspaceArgs, WithTypename<Workspace>>
};

export type GraphCacheUpdaters = {
  Mutation?: {
    addNotebookToSection?: GraphCacheUpdateResolver<{ addNotebookToSection: Maybe<Scalars['Boolean']> }, MutationAddNotebookToSectionArgs>,
    addSectionToWorkspace?: GraphCacheUpdateResolver<{ addSectionToWorkspace: Maybe<WithTypename<Section>> }, MutationAddSectionToWorkspaceArgs>,
    addTagToPad?: GraphCacheUpdateResolver<{ addTagToPad: Maybe<Scalars['Boolean']> }, MutationAddTagToPadArgs>,
    attachFileToPad?: GraphCacheUpdateResolver<{ attachFileToPad: Maybe<WithTypename<Attachment>> }, MutationAttachFileToPadArgs>,
    createExternalDataSource?: GraphCacheUpdateResolver<{ createExternalDataSource: Maybe<WithTypename<ExternalDataSource>> }, MutationCreateExternalDataSourceArgs>,
    createLogs?: GraphCacheUpdateResolver<{ createLogs: Maybe<Scalars['Boolean']> }, MutationCreateLogsArgs>,
    createOrUpdateSnapshot?: GraphCacheUpdateResolver<{ createOrUpdateSnapshot: Scalars['Boolean'] }, MutationCreateOrUpdateSnapshotArgs>,
    createPad?: GraphCacheUpdateResolver<{ createPad: WithTypename<Pad> }, MutationCreatePadArgs>,
    createRole?: GraphCacheUpdateResolver<{ createRole: WithTypename<Role> }, MutationCreateRoleArgs>,
    createSecret?: GraphCacheUpdateResolver<{ createSecret: WithTypename<Secret> }, MutationCreateSecretArgs>,
    createUserViaMagicLink?: GraphCacheUpdateResolver<{ createUserViaMagicLink: WithTypename<User> }, MutationCreateUserViaMagicLinkArgs>,
    createWorkspace?: GraphCacheUpdateResolver<{ createWorkspace: WithTypename<Workspace> }, MutationCreateWorkspaceArgs>,
    doNothing?: GraphCacheUpdateResolver<{ doNothing: Maybe<Scalars['Boolean']> }, Record<string, never>>,
    duplicatePad?: GraphCacheUpdateResolver<{ duplicatePad: WithTypename<Pad> }, MutationDuplicatePadArgs>,
    fulfilGoal?: GraphCacheUpdateResolver<{ fulfilGoal: Scalars['Boolean'] }, MutationFulfilGoalArgs>,
    getCreateAttachmentForm?: GraphCacheUpdateResolver<{ getCreateAttachmentForm: WithTypename<CreateAttachmentForm> }, MutationGetCreateAttachmentFormArgs>,
    importPad?: GraphCacheUpdateResolver<{ importPad: WithTypename<Pad> }, MutationImportPadArgs>,
    inviteUserToRole?: GraphCacheUpdateResolver<{ inviteUserToRole: Array<WithTypename<RoleInvitation>> }, MutationInviteUserToRoleArgs>,
    movePad?: GraphCacheUpdateResolver<{ movePad: WithTypename<Pad> }, MutationMovePadArgs>,
    pretendUser?: GraphCacheUpdateResolver<{ pretendUser: Maybe<Scalars['Boolean']> }, MutationPretendUserArgs>,
    removeAttachmentFromPad?: GraphCacheUpdateResolver<{ removeAttachmentFromPad: Maybe<Scalars['Boolean']> }, MutationRemoveAttachmentFromPadArgs>,
    removeExternalDataSource?: GraphCacheUpdateResolver<{ removeExternalDataSource: Maybe<Scalars['Boolean']> }, MutationRemoveExternalDataSourceArgs>,
    removePad?: GraphCacheUpdateResolver<{ removePad: Maybe<Scalars['Boolean']> }, MutationRemovePadArgs>,
    removeRole?: GraphCacheUpdateResolver<{ removeRole: Maybe<Scalars['Boolean']> }, MutationRemoveRoleArgs>,
    removeSecret?: GraphCacheUpdateResolver<{ removeSecret: Scalars['Boolean'] }, MutationRemoveSecretArgs>,
    removeSectionFromWorkspace?: GraphCacheUpdateResolver<{ removeSectionFromWorkspace: Maybe<Scalars['Boolean']> }, MutationRemoveSectionFromWorkspaceArgs>,
    removeSelfFromRole?: GraphCacheUpdateResolver<{ removeSelfFromRole: Maybe<Scalars['Boolean']> }, MutationRemoveSelfFromRoleArgs>,
    removeTagFromPad?: GraphCacheUpdateResolver<{ removeTagFromPad: Maybe<Scalars['Boolean']> }, MutationRemoveTagFromPadArgs>,
    removeUserFromRole?: GraphCacheUpdateResolver<{ removeUserFromRole: Maybe<Scalars['Boolean']> }, MutationRemoveUserFromRoleArgs>,
    removeWorkspace?: GraphCacheUpdateResolver<{ removeWorkspace: Maybe<Scalars['Boolean']> }, MutationRemoveWorkspaceArgs>,
    resendRegistrationMagicLinkEmail?: GraphCacheUpdateResolver<{ resendRegistrationMagicLinkEmail: Maybe<Scalars['Boolean']> }, MutationResendRegistrationMagicLinkEmailArgs>,
    setPadPublic?: GraphCacheUpdateResolver<{ setPadPublic: Scalars['Boolean'] }, MutationSetPadPublicArgs>,
    setUsername?: GraphCacheUpdateResolver<{ setUsername: Scalars['Boolean'] }, MutationSetUsernameArgs>,
    shareExternalDataSourceWithEmail?: GraphCacheUpdateResolver<{ shareExternalDataSourceWithEmail: Maybe<WithTypename<ExternalDataSource>> }, MutationShareExternalDataSourceWithEmailArgs>,
    shareExternalDataSourceWithRole?: GraphCacheUpdateResolver<{ shareExternalDataSourceWithRole: Maybe<Scalars['Boolean']> }, MutationShareExternalDataSourceWithRoleArgs>,
    shareExternalDataSourceWithUser?: GraphCacheUpdateResolver<{ shareExternalDataSourceWithUser: Maybe<WithTypename<ExternalDataSource>> }, MutationShareExternalDataSourceWithUserArgs>,
    sharePadWithEmail?: GraphCacheUpdateResolver<{ sharePadWithEmail: WithTypename<Pad> }, MutationSharePadWithEmailArgs>,
    sharePadWithRole?: GraphCacheUpdateResolver<{ sharePadWithRole: Maybe<Scalars['Boolean']> }, MutationSharePadWithRoleArgs>,
    sharePadWithSecret?: GraphCacheUpdateResolver<{ sharePadWithSecret: Scalars['String'] }, MutationSharePadWithSecretArgs>,
    sharePadWithUser?: GraphCacheUpdateResolver<{ sharePadWithUser: Maybe<WithTypename<Pad>> }, MutationSharePadWithUserArgs>,
    shareWorkspaceWithEmail?: GraphCacheUpdateResolver<{ shareWorkspaceWithEmail: WithTypename<Workspace> }, MutationShareWorkspaceWithEmailArgs>,
    syncWorkspaceSeats?: GraphCacheUpdateResolver<{ syncWorkspaceSeats: WithTypename<WorkspaceSubscription> }, MutationSyncWorkspaceSeatsArgs>,
    unshareExternalDataSourceWithRole?: GraphCacheUpdateResolver<{ unshareExternalDataSourceWithRole: Maybe<Scalars['Boolean']> }, MutationUnshareExternalDataSourceWithRoleArgs>,
    unshareExternalDataSourceWithUser?: GraphCacheUpdateResolver<{ unshareExternalDataSourceWithUser: WithTypename<ExternalDataSource> }, MutationUnshareExternalDataSourceWithUserArgs>,
    unshareNotebookWithSecret?: GraphCacheUpdateResolver<{ unshareNotebookWithSecret: Maybe<Scalars['Boolean']> }, MutationUnshareNotebookWithSecretArgs>,
    unsharePadWithRole?: GraphCacheUpdateResolver<{ unsharePadWithRole: Maybe<Scalars['Boolean']> }, MutationUnsharePadWithRoleArgs>,
    unsharePadWithUser?: GraphCacheUpdateResolver<{ unsharePadWithUser: Maybe<WithTypename<Pad>> }, MutationUnsharePadWithUserArgs>,
    unshareWorkspaceWithUser?: GraphCacheUpdateResolver<{ unshareWorkspaceWithUser: Maybe<WithTypename<Workspace>> }, MutationUnshareWorkspaceWithUserArgs>,
    updateExternalDataSource?: GraphCacheUpdateResolver<{ updateExternalDataSource: Maybe<WithTypename<ExternalDataSource>> }, MutationUpdateExternalDataSourceArgs>,
    updatePad?: GraphCacheUpdateResolver<{ updatePad: WithTypename<Pad> }, MutationUpdatePadArgs>,
    updateSecret?: GraphCacheUpdateResolver<{ updateSecret: WithTypename<Secret> }, MutationUpdateSecretArgs>,
    updateSectionInWorkspace?: GraphCacheUpdateResolver<{ updateSectionInWorkspace: Maybe<Scalars['Boolean']> }, MutationUpdateSectionInWorkspaceArgs>,
    updateSelf?: GraphCacheUpdateResolver<{ updateSelf: WithTypename<User> }, MutationUpdateSelfArgs>,
    updateWorkspace?: GraphCacheUpdateResolver<{ updateWorkspace: WithTypename<Workspace> }, MutationUpdateWorkspaceArgs>
  },
  Subscription?: {
    hello?: GraphCacheUpdateResolver<{ hello: Maybe<Scalars['String']> }, Record<string, never>>,
    padsChanged?: GraphCacheUpdateResolver<{ padsChanged: WithTypename<PadChanges> }, SubscriptionPadsChangedArgs>,
    sectionsChanged?: GraphCacheUpdateResolver<{ sectionsChanged: WithTypename<SectionChanges> }, SubscriptionSectionsChangedArgs>,
    subscribeToNothing?: GraphCacheUpdateResolver<{ subscribeToNothing: Maybe<Scalars['Boolean']> }, Record<string, never>>,
    tagsChanged?: GraphCacheUpdateResolver<{ tagsChanged: WithTypename<TagChanges> }, SubscriptionTagsChangedArgs>,
    workspacesChanged?: GraphCacheUpdateResolver<{ workspacesChanged: WithTypename<WorkspacesChanges> }, Record<string, never>>
  },
};

export type GraphCacheConfig = {
  schema?: IntrospectionData,
  updates?: GraphCacheUpdaters,
  keys?: GraphCacheKeysConfig,
  optimistic?: GraphCacheOptimisticUpdaters,
  resolvers?: GraphCacheResolvers,
  storage?: GraphCacheStorageAdapter
};