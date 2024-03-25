// @ts-nocheck
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { GraphqlContext } from './context';
export type Maybe<T> = T extends PromiseLike<infer U> ? Promise<U | null | undefined> : T | undefined;
export type InputMaybe<T> = T extends PromiseLike<infer U> ? Promise<U | null | undefined> : T | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
};

export type Annotation = {
  __typename?: 'Annotation';
  block_id: Scalars['String']['output'];
  content: Scalars['String']['output'];
  dateCreated: Scalars['Float']['output'];
  dateUpdated?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  pad_id: Scalars['String']['output'];
  scenario_id?: Maybe<Scalars['String']['output']>;
  user?: Maybe<AnnotationUser>;
  user_id: Scalars['String']['output'];
};

export type AnnotationUser = {
  __typename?: 'AnnotationUser';
  avatar?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  username: Scalars['String']['output'];
};

export type Attachment = {
  __typename?: 'Attachment';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  fileName: Scalars['String']['output'];
  fileSize: Scalars['Int']['output'];
  fileType: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  pad?: Maybe<Pad>;
  padId: Scalars['String']['output'];
  uploadedBy?: Maybe<User>;
  url: Scalars['String']['output'];
  userId?: Maybe<Scalars['String']['output']>;
};

export type CheckoutSessionInfo = {
  __typename?: 'CheckoutSessionInfo';
  clientSecret?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
};

export type CreateAttachmentForm = {
  __typename?: 'CreateAttachmentForm';
  fields: Array<KeyValue>;
  handle: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type CreateOrUpdateSnapshotInput = {
  forceSearchIndexUpdate?: InputMaybe<Scalars['Boolean']['input']>;
  notebookId: Scalars['ID']['input'];
  remoteState?: InputMaybe<Scalars['String']['input']>;
  remoteVersion?: InputMaybe<Scalars['String']['input']>;
  snapshotName: Scalars['String']['input'];
};

export type CreditPricePlan = {
  __typename?: 'CreditPricePlan';
  credits: Scalars['Int']['output'];
  currency: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isDefault?: Maybe<Scalars['Boolean']['output']>;
  price: Scalars['Int']['output'];
  promotionTag?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type CreditsPlan = {
  __typename?: 'CreditsPlan';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  plans: Array<CreditPricePlan>;
  title?: Maybe<Scalars['String']['output']>;
};

export type ExternalDataSource = {
  __typename?: 'ExternalDataSource';
  access: ResourceAccess;
  authUrl?: Maybe<Scalars['String']['output']>;
  dataLinks: Array<ExternalDataSourceDataLink>;
  dataSourceName?: Maybe<Scalars['String']['output']>;
  dataUrl?: Maybe<Scalars['String']['output']>;
  externalId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  keys: Array<ExternalKey>;
  name: Scalars['String']['output'];
  owner: ExternalDataSourceOwnership;
  ownerId: Scalars['String']['output'];
  provider: ExternalProvider;
};

export type ExternalDataSourceCreateInput = {
  dataSourceName?: InputMaybe<Scalars['String']['input']>;
  externalId: Scalars['String']['input'];
  name: Scalars['String']['input'];
  padId?: InputMaybe<Scalars['String']['input']>;
  provider: ExternalProvider;
  workspaceId?: InputMaybe<Scalars['String']['input']>;
};

export type ExternalDataSourceDataLink = {
  __typename?: 'ExternalDataSourceDataLink';
  id: Scalars['ID']['output'];
  method?: Maybe<HttpMethods>;
  name: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type ExternalDataSourceOwnership =
  | 'PAD'
  | 'WORKSPACE';

export type ExternalDataSourceUpdateInput = {
  dataSourceName?: InputMaybe<Scalars['String']['input']>;
  externalId?: InputMaybe<Scalars['String']['input']>;
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

export type ExternalProvider =
  | 'cockroachdb'
  | 'csv'
  | 'decipad'
  | 'gsheets'
  | 'json'
  | 'mariadb'
  | 'mssql'
  | 'mysql'
  | 'notion'
  | 'oracledb'
  | 'postgresql'
  | 'redshift';

export type Gist =
  | 'AI';

export type GoalFulfilmentInput = {
  goalName: Scalars['String']['input'];
};

export type HttpMethods =
  | 'CONNECT'
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'OPTIONS'
  | 'PATCH'
  | 'POST'
  | 'PUT'
  | 'TRACE';

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
  claimNotebook?: Maybe<Pad>;
  createAnnotation?: Maybe<Annotation>;
  createExternalDataLink?: Maybe<ExternalDataSourceDataLink>;
  createExternalDataSource?: Maybe<ExternalDataSource>;
  createLogs?: Maybe<Scalars['Boolean']['output']>;
  createOrUpdateSnapshot: Scalars['Boolean']['output'];
  createPad: Pad;
  createRole: Role;
  createSecret: Secret;
  createSnapshot: Scalars['Boolean']['output'];
  createUserViaMagicLink: User;
  createWorkspace: Workspace;
  deleteAnnotation?: Maybe<Annotation>;
  doNothing?: Maybe<Scalars['Boolean']['output']>;
  duplicatePad: Pad;
  getCreateAttachmentForm: CreateAttachmentForm;
  importPad: Pad;
  incrementQueryCount: WorkspaceExecutedQuery;
  inviteUserToRole: Array<RoleInvitation>;
  movePad: Pad;
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
  updateAnnotation?: Maybe<Annotation>;
  updateExternalDataSource?: Maybe<ExternalDataSource>;
  updateExtraAiAllowance?: Maybe<NewResourceQuotaLimit>;
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


export type MutationClaimNotebookArgs = {
  notebookId: Scalars['ID']['input'];
};


export type MutationCreateAnnotationArgs = {
  blockId: Scalars['String']['input'];
  content: Scalars['String']['input'];
  padId: Scalars['String']['input'];
  scenarioId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateExternalDataLinkArgs = {
  externalDataId: Scalars['String']['input'];
  method?: InputMaybe<HttpMethods>;
  name: Scalars['String']['input'];
  url: Scalars['String']['input'];
};


export type MutationCreateExternalDataSourceArgs = {
  dataSource: ExternalDataSourceCreateInput;
};


export type MutationCreateLogsArgs = {
  input: LogInput;
};


export type MutationCreateOrUpdateSnapshotArgs = {
  params: CreateOrUpdateSnapshotInput;
};


export type MutationCreatePadArgs = {
  pad: PadInput;
  sectionId?: InputMaybe<Scalars['ID']['input']>;
  workspaceId: Scalars['ID']['input'];
};


export type MutationCreateRoleArgs = {
  role: RoleInput;
};


export type MutationCreateSecretArgs = {
  secret: SecretInput;
  workspaceId: Scalars['ID']['input'];
};


export type MutationCreateSnapshotArgs = {
  notebookId: Scalars['ID']['input'];
};


export type MutationCreateUserViaMagicLinkArgs = {
  email: Scalars['String']['input'];
};


export type MutationCreateWorkspaceArgs = {
  workspace: WorkspaceInput;
};


export type MutationDeleteAnnotationArgs = {
  id: Scalars['String']['input'];
};


export type MutationDuplicatePadArgs = {
  document?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  targetWorkspace: Scalars['ID']['input'];
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


export type MutationIncrementQueryCountArgs = {
  id: Scalars['ID']['input'];
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
  publishState: Publish_State;
};


export type MutationSetUsernameArgs = {
  props: UsernameInput;
};


export type MutationShareExternalDataSourceWithEmailArgs = {
  email: Scalars['String']['input'];
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


export type MutationUpdateAnnotationArgs = {
  content: Scalars['String']['input'];
  id: Scalars['String']['input'];
};


export type MutationUpdateExternalDataSourceArgs = {
  dataSource: ExternalDataSourceUpdateInput;
  id: Scalars['ID']['input'];
};


export type MutationUpdateExtraAiAllowanceArgs = {
  paymentMethodId: Scalars['String']['input'];
  resourceId: Scalars['String']['input'];
  resourceType: Scalars['String']['input'];
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

export type NewResourceQuotaLimit = {
  __typename?: 'NewResourceQuotaLimit';
  newQuotaLimit: Scalars['Float']['output'];
};

export type Publish_State =
  | 'PRIVATE'
  | 'PUBLIC'
  | 'PUBLICLY_HIGHLIGHTED';

export type Pad = {
  __typename?: 'Pad';
  access: ResourceAccess;
  archived?: Maybe<Scalars['Boolean']['output']>;
  attachments: Array<Attachment>;
  banned?: Maybe<Scalars['Boolean']['output']>;
  canPublicDuplicate?: Maybe<Scalars['Boolean']['output']>;
  createdAt: Scalars['DateTime']['output'];
  document: Scalars['String']['output'];
  gist?: Maybe<Gist>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  initialState?: Maybe<Scalars['String']['output']>;
  isPublic?: Maybe<Scalars['Boolean']['output']>;
  isTemplate?: Maybe<Scalars['Boolean']['output']>;
  myPermissionType?: Maybe<PermissionType>;
  name: Scalars['String']['output'];
  padConnectionParams: PadConnectionParams;
  section?: Maybe<Section>;
  sectionId?: Maybe<Scalars['ID']['output']>;
  snapshots: Array<PadSnapshot>;
  status?: Maybe<Scalars['String']['output']>;
  tags: Array<Scalars['String']['output']>;
  userAllowsPublicHighlighting?: Maybe<Scalars['Boolean']['output']>;
  workspace?: Maybe<Workspace>;
  workspaceId?: Maybe<Scalars['ID']['output']>;
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
  canPublicDuplicate?: InputMaybe<Scalars['Boolean']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  isTemplate?: InputMaybe<Scalars['Boolean']['input']>;
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

export type Pageable = SharedResource;

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

export type PagedTemplateSearchResult = {
  __typename?: 'PagedTemplateSearchResult';
  count: Scalars['Int']['output'];
  cursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  items: Array<TemplateSearchResult>;
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

export type PermissionType =
  | 'ADMIN'
  | 'READ'
  | 'WRITE';

export type Query = {
  __typename?: 'Query';
  featuredPad?: Maybe<Pad>;
  getAnnotationsByPadId?: Maybe<Array<Maybe<Annotation>>>;
  getCreditsPlans?: Maybe<CreditsPlan>;
  getExternalDataSource: ExternalDataSource;
  getExternalDataSources: Array<ExternalDataSource>;
  getExternalDataSourcesWorkspace: Array<ExternalDataSource>;
  getPadById?: Maybe<Pad>;
  getStripeCheckoutSessionInfo?: Maybe<CheckoutSessionInfo>;
  getSubscriptionsPlans?: Maybe<Array<Maybe<SubscriptionPlan>>>;
  getWorkspaceById?: Maybe<Workspace>;
  getWorkspaceSecrets: Array<Secret>;
  me?: Maybe<User>;
  pads: PagedPadResult;
  padsByTag: PagedPadResult;
  padsSharedWithMe: PagedPadResult;
  publiclyHighlightedPads: PagedPadResult;
  searchTemplates: PagedTemplateSearchResult;
  sections: Array<Section>;
  self?: Maybe<User>;
  tags: Array<Scalars['String']['output']>;
  version?: Maybe<Scalars['String']['output']>;
  workspaces: Array<Workspace>;
};


export type QueryGetAnnotationsByPadIdArgs = {
  padId: Scalars['String']['input'];
};


export type QueryGetExternalDataSourceArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetExternalDataSourcesArgs = {
  notebookId: Scalars['ID']['input'];
};


export type QueryGetExternalDataSourcesWorkspaceArgs = {
  workspaceId: Scalars['ID']['input'];
};


export type QueryGetPadByIdArgs = {
  id: Scalars['ID']['input'];
  snapshotName?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetStripeCheckoutSessionInfoArgs = {
  priceId: Scalars['ID']['input'];
  workspaceId: Scalars['ID']['input'];
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


export type QueryPubliclyHighlightedPadsArgs = {
  page: PageInput;
};


export type QuerySearchTemplatesArgs = {
  faster?: InputMaybe<Scalars['Boolean']['input']>;
  page: PageInput;
  prompt: Scalars['String']['input'];
};


export type QuerySectionsArgs = {
  workspaceId: Scalars['ID']['input'];
};


export type QueryTagsArgs = {
  workspaceId: Scalars['ID']['input'];
};

export type ResourceAccess = {
  __typename?: 'ResourceAccess';
  id: Scalars['ID']['output'];
  roles: Array<RoleAccess>;
  users: Array<UserAccess>;
};

export type ResourceTypes =
  | 'openai'
  | 'storage';

export type ResourceUsage = {
  __typename?: 'ResourceUsage';
  consumption: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  originalAmount?: Maybe<Scalars['Float']['output']>;
  resourceType: ResourceTypes;
};

export type Role = {
  __typename?: 'Role';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  users: Array<User>;
  workspace: Workspace;
  workspaceId: Scalars['String']['output'];
};

export type RoleAccess = {
  __typename?: 'RoleAccess';
  canComment: Scalars['Boolean']['output'];
  permission: PermissionType;
  role: Role;
  roleId: Scalars['ID']['output'];
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

export type ShareWithEmailInput = {
  __typename?: 'ShareWithEmailInput';
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  permissionType: PermissionType;
};

export type ShareWithRoleInput = {
  __typename?: 'ShareWithRoleInput';
  id: Scalars['ID']['output'];
  permissionType: PermissionType;
  roleId: Scalars['ID']['output'];
};

export type ShareWithSecretInput = {
  __typename?: 'ShareWithSecretInput';
  id: Scalars['ID']['output'];
  permissionType: PermissionType;
};

export type ShareWithUserInput = {
  __typename?: 'ShareWithUserInput';
  id: Scalars['ID']['output'];
  permissionType: PermissionType;
  userId: Scalars['ID']['output'];
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

export type SubscriptionPaymentStatus =
  | 'no_payment_required'
  | 'paid'
  | 'unpaid';

export type SubscriptionPlan = {
  __typename?: 'SubscriptionPlan';
  credits?: Maybe<Scalars['Int']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isDefault?: Maybe<Scalars['Boolean']['output']>;
  key: Scalars['String']['output'];
  paymentLink?: Maybe<Scalars['String']['output']>;
  price?: Maybe<Scalars['Int']['output']>;
  pricePerSeat?: Maybe<Scalars['Int']['output']>;
  queries?: Maybe<Scalars['Int']['output']>;
  seats?: Maybe<Scalars['Int']['output']>;
  storage?: Maybe<Scalars['Int']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type SubscriptionPlansNames =
  | 'enterprise'
  | 'free'
  | 'personal'
  | 'pro'
  | 'team';

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'paused'
  | 'trialing'
  | 'unpaid';

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

export type TemplateSearchResult = {
  __typename?: 'TemplateSearchResult';
  notebook: TemplateSearchResultNotebook;
  summary?: Maybe<Scalars['String']['output']>;
};

export type TemplateSearchResultNotebook = {
  __typename?: 'TemplateSearchResultNotebook';
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type UnshareWithRoleInput = {
  __typename?: 'UnshareWithRoleInput';
  id: Scalars['ID']['output'];
  roleId: Scalars['ID']['output'];
};

export type UnshareWithUserInput = {
  __typename?: 'UnshareWithUserInput';
  id: Scalars['ID']['output'];
  userId: Scalars['ID']['output'];
};

export type User = {
  __typename?: 'User';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  emailValidatedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  onboarded?: Maybe<Scalars['Boolean']['output']>;
  resourceUsages?: Maybe<Array<Maybe<ResourceUsage>>>;
  username?: Maybe<Scalars['String']['output']>;
};

export type UserAccess = {
  __typename?: 'UserAccess';
  canComment: Scalars['Boolean']['output'];
  permission: PermissionType;
  user?: Maybe<User>;
  userId?: Maybe<Scalars['ID']['output']>;
};

export type UserInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
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
  membersCount?: Maybe<Scalars['Int']['output']>;
  myPermissionType?: Maybe<PermissionType>;
  name: Scalars['String']['output'];
  pads: PagedPadResult;
  plan?: Maybe<SubscriptionPlansNames>;
  resourceUsages?: Maybe<Array<Maybe<ResourceUsage>>>;
  roles?: Maybe<Array<Role>>;
  secrets: Array<Secret>;
  sections: Array<Section>;
  workspaceExecutedQuery?: Maybe<WorkspaceExecutedQuery>;
  workspaceSubscription?: Maybe<WorkspaceSubscription>;
};


export type WorkspacePadsArgs = {
  page: PageInput;
};

export type WorkspaceAccess = {
  __typename?: 'WorkspaceAccess';
  id: Scalars['ID']['output'];
  roles?: Maybe<Array<RoleAccess>>;
  users?: Maybe<Array<UserAccess>>;
};

export type WorkspaceExecutedQuery = {
  __typename?: 'WorkspaceExecutedQuery';
  id: Scalars['ID']['output'];
  queryCount: Scalars['Int']['output'];
  query_reset_date?: Maybe<Scalars['DateTime']['output']>;
  quotaLimit: Scalars['Int']['output'];
  workspace?: Maybe<Workspace>;
};

export type WorkspaceInput = {
  name: Scalars['String']['input'];
};

export type WorkspaceSubscription = {
  __typename?: 'WorkspaceSubscription';
  credits?: Maybe<Scalars['Int']['output']>;
  id: Scalars['String']['output'];
  paymentStatus: SubscriptionPaymentStatus;
  queries?: Maybe<Scalars['Int']['output']>;
  seats?: Maybe<Scalars['Int']['output']>;
  status?: Maybe<SubscriptionStatus>;
  storage?: Maybe<Scalars['Int']['output']>;
  workspace?: Maybe<Workspace>;
};

export type WorkspacesChanges = {
  __typename?: 'WorkspacesChanges';
  added: Array<Workspace>;
  removed: Array<Scalars['ID']['output']>;
  updated: Array<Workspace>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping of union types */
export type ResolversUnionTypes<RefType extends Record<string, unknown>> = {
  Pageable: ( SharedResource );
};


/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Annotation: ResolverTypeWrapper<Annotation>;
  AnnotationUser: ResolverTypeWrapper<AnnotationUser>;
  Attachment: ResolverTypeWrapper<Attachment>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CheckoutSessionInfo: ResolverTypeWrapper<CheckoutSessionInfo>;
  CreateAttachmentForm: ResolverTypeWrapper<CreateAttachmentForm>;
  CreateOrUpdateSnapshotInput: CreateOrUpdateSnapshotInput;
  CreditPricePlan: ResolverTypeWrapper<CreditPricePlan>;
  CreditsPlan: ResolverTypeWrapper<CreditsPlan>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  ExternalDataSource: ResolverTypeWrapper<ExternalDataSource>;
  ExternalDataSourceCreateInput: ExternalDataSourceCreateInput;
  ExternalDataSourceDataLink: ResolverTypeWrapper<ExternalDataSourceDataLink>;
  ExternalDataSourceOwnership: ExternalDataSourceOwnership;
  ExternalDataSourceUpdateInput: ExternalDataSourceUpdateInput;
  ExternalKey: ResolverTypeWrapper<ExternalKey>;
  ExternalProvider: ExternalProvider;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  Gist: Gist;
  GoalFulfilmentInput: GoalFulfilmentInput;
  HTTPMethods: HttpMethods;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  KeyValue: ResolverTypeWrapper<KeyValue>;
  LogEntry: LogEntry;
  LogInput: LogInput;
  Mutation: ResolverTypeWrapper<{}>;
  NewResourceQuotaLimit: ResolverTypeWrapper<NewResourceQuotaLimit>;
  PUBLISH_STATE: Publish_State;
  Pad: ResolverTypeWrapper<Pad>;
  PadChanges: ResolverTypeWrapper<PadChanges>;
  PadConnectionParams: ResolverTypeWrapper<PadConnectionParams>;
  PadInput: PadInput;
  PadSnapshot: ResolverTypeWrapper<PadSnapshot>;
  PageInput: PageInput;
  Pageable: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['Pageable']>;
  PagedPadResult: ResolverTypeWrapper<PagedPadResult>;
  PagedResult: ResolverTypeWrapper<Omit<PagedResult, 'items'> & { items: Array<ResolversTypes['Pageable']> }>;
  PagedTemplateSearchResult: ResolverTypeWrapper<PagedTemplateSearchResult>;
  Permission: ResolverTypeWrapper<Permission>;
  PermissionType: PermissionType;
  Query: ResolverTypeWrapper<{}>;
  ResourceAccess: ResolverTypeWrapper<ResourceAccess>;
  ResourceTypes: ResourceTypes;
  ResourceUsage: ResolverTypeWrapper<ResourceUsage>;
  Role: ResolverTypeWrapper<Role>;
  RoleAccess: ResolverTypeWrapper<RoleAccess>;
  RoleInput: RoleInput;
  RoleInvitation: ResolverTypeWrapper<RoleInvitation>;
  Secret: ResolverTypeWrapper<Secret>;
  SecretAccess: ResolverTypeWrapper<SecretAccess>;
  SecretInput: SecretInput;
  Section: ResolverTypeWrapper<Section>;
  SectionChanges: ResolverTypeWrapper<SectionChanges>;
  SectionInput: SectionInput;
  ShareInvitation: ResolverTypeWrapper<ShareInvitation>;
  ShareWithEmailInput: ResolverTypeWrapper<ShareWithEmailInput>;
  ShareWithRoleInput: ResolverTypeWrapper<ShareWithRoleInput>;
  ShareWithSecretInput: ResolverTypeWrapper<ShareWithSecretInput>;
  ShareWithUserInput: ResolverTypeWrapper<ShareWithUserInput>;
  SharedResource: ResolverTypeWrapper<SharedResource>;
  SharedWith: ResolverTypeWrapper<SharedWith>;
  SharedWithRole: ResolverTypeWrapper<SharedWithRole>;
  SharedWithUser: ResolverTypeWrapper<SharedWithUser>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Subscription: ResolverTypeWrapper<{}>;
  SubscriptionPaymentStatus: SubscriptionPaymentStatus;
  SubscriptionPlan: ResolverTypeWrapper<SubscriptionPlan>;
  SubscriptionPlansNames: SubscriptionPlansNames;
  SubscriptionStatus: SubscriptionStatus;
  TagChanges: ResolverTypeWrapper<TagChanges>;
  TagRecord: ResolverTypeWrapper<TagRecord>;
  TemplateSearchResult: ResolverTypeWrapper<TemplateSearchResult>;
  TemplateSearchResultNotebook: ResolverTypeWrapper<TemplateSearchResultNotebook>;
  UnshareWithRoleInput: ResolverTypeWrapper<UnshareWithRoleInput>;
  UnshareWithUserInput: ResolverTypeWrapper<UnshareWithUserInput>;
  User: ResolverTypeWrapper<User>;
  UserAccess: ResolverTypeWrapper<UserAccess>;
  UserInput: UserInput;
  UsernameInput: UsernameInput;
  Workspace: ResolverTypeWrapper<Workspace>;
  WorkspaceAccess: ResolverTypeWrapper<WorkspaceAccess>;
  WorkspaceExecutedQuery: ResolverTypeWrapper<WorkspaceExecutedQuery>;
  WorkspaceInput: WorkspaceInput;
  WorkspaceSubscription: ResolverTypeWrapper<WorkspaceSubscription>;
  WorkspacesChanges: ResolverTypeWrapper<WorkspacesChanges>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Annotation: Annotation;
  AnnotationUser: AnnotationUser;
  Attachment: Attachment;
  Boolean: Scalars['Boolean']['output'];
  CheckoutSessionInfo: CheckoutSessionInfo;
  CreateAttachmentForm: CreateAttachmentForm;
  CreateOrUpdateSnapshotInput: CreateOrUpdateSnapshotInput;
  CreditPricePlan: CreditPricePlan;
  CreditsPlan: CreditsPlan;
  DateTime: Scalars['DateTime']['output'];
  ExternalDataSource: ExternalDataSource;
  ExternalDataSourceCreateInput: ExternalDataSourceCreateInput;
  ExternalDataSourceDataLink: ExternalDataSourceDataLink;
  ExternalDataSourceUpdateInput: ExternalDataSourceUpdateInput;
  ExternalKey: ExternalKey;
  Float: Scalars['Float']['output'];
  GoalFulfilmentInput: GoalFulfilmentInput;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  KeyValue: KeyValue;
  LogEntry: LogEntry;
  LogInput: LogInput;
  Mutation: {};
  NewResourceQuotaLimit: NewResourceQuotaLimit;
  Pad: Pad;
  PadChanges: PadChanges;
  PadConnectionParams: PadConnectionParams;
  PadInput: PadInput;
  PadSnapshot: PadSnapshot;
  PageInput: PageInput;
  Pageable: ResolversUnionTypes<ResolversParentTypes>['Pageable'];
  PagedPadResult: PagedPadResult;
  PagedResult: Omit<PagedResult, 'items'> & { items: Array<ResolversParentTypes['Pageable']> };
  PagedTemplateSearchResult: PagedTemplateSearchResult;
  Permission: Permission;
  Query: {};
  ResourceAccess: ResourceAccess;
  ResourceUsage: ResourceUsage;
  Role: Role;
  RoleAccess: RoleAccess;
  RoleInput: RoleInput;
  RoleInvitation: RoleInvitation;
  Secret: Secret;
  SecretAccess: SecretAccess;
  SecretInput: SecretInput;
  Section: Section;
  SectionChanges: SectionChanges;
  SectionInput: SectionInput;
  ShareInvitation: ShareInvitation;
  ShareWithEmailInput: ShareWithEmailInput;
  ShareWithRoleInput: ShareWithRoleInput;
  ShareWithSecretInput: ShareWithSecretInput;
  ShareWithUserInput: ShareWithUserInput;
  SharedResource: SharedResource;
  SharedWith: SharedWith;
  SharedWithRole: SharedWithRole;
  SharedWithUser: SharedWithUser;
  String: Scalars['String']['output'];
  Subscription: {};
  SubscriptionPlan: SubscriptionPlan;
  TagChanges: TagChanges;
  TagRecord: TagRecord;
  TemplateSearchResult: TemplateSearchResult;
  TemplateSearchResultNotebook: TemplateSearchResultNotebook;
  UnshareWithRoleInput: UnshareWithRoleInput;
  UnshareWithUserInput: UnshareWithUserInput;
  User: User;
  UserAccess: UserAccess;
  UserInput: UserInput;
  UsernameInput: UsernameInput;
  Workspace: Workspace;
  WorkspaceAccess: WorkspaceAccess;
  WorkspaceExecutedQuery: WorkspaceExecutedQuery;
  WorkspaceInput: WorkspaceInput;
  WorkspaceSubscription: WorkspaceSubscription;
  WorkspacesChanges: WorkspacesChanges;
};

export type AnnotationResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['Annotation'] = ResolversParentTypes['Annotation']> = {
  block_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  dateCreated?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  dateUpdated?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  pad_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scenario_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['AnnotationUser']>, ParentType, ContextType>;
  user_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AnnotationUserResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['AnnotationUser'] = ResolversParentTypes['AnnotationUser']> = {
  avatar?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AttachmentResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['Attachment'] = ResolversParentTypes['Attachment']> = {
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  fileName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fileSize?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  fileType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  pad?: Resolver<Maybe<ResolversTypes['Pad']>, ParentType, ContextType>;
  padId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  uploadedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CheckoutSessionInfoResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['CheckoutSessionInfo'] = ResolversParentTypes['CheckoutSessionInfo']> = {
  clientSecret?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateAttachmentFormResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['CreateAttachmentForm'] = ResolversParentTypes['CreateAttachmentForm']> = {
  fields?: Resolver<Array<ResolversTypes['KeyValue']>, ParentType, ContextType>;
  handle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreditPricePlanResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['CreditPricePlan'] = ResolversParentTypes['CreditPricePlan']> = {
  credits?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isDefault?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  price?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  promotionTag?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreditsPlanResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['CreditsPlan'] = ResolversParentTypes['CreditsPlan']> = {
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  plans?: Resolver<Array<ResolversTypes['CreditPricePlan']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type ExternalDataSourceResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['ExternalDataSource'] = ResolversParentTypes['ExternalDataSource']> = {
  access?: Resolver<ResolversTypes['ResourceAccess'], ParentType, ContextType>;
  authUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dataLinks?: Resolver<Array<ResolversTypes['ExternalDataSourceDataLink']>, ParentType, ContextType>;
  dataSourceName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dataUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  externalId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  keys?: Resolver<Array<ResolversTypes['ExternalKey']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['ExternalDataSourceOwnership'], ParentType, ContextType>;
  ownerId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  provider?: Resolver<ResolversTypes['ExternalProvider'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ExternalDataSourceDataLinkResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['ExternalDataSourceDataLink'] = ResolversParentTypes['ExternalDataSourceDataLink']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  method?: Resolver<Maybe<ResolversTypes['HTTPMethods']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ExternalKeyResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['ExternalKey'] = ResolversParentTypes['ExternalKey']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  expiresAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastError?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastUsedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type KeyValueResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['KeyValue'] = ResolversParentTypes['KeyValue']> = {
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addNotebookToSection?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationAddNotebookToSectionArgs, 'notebookId' | 'sectionId'>>;
  addSectionToWorkspace?: Resolver<Maybe<ResolversTypes['Section']>, ParentType, ContextType, RequireFields<MutationAddSectionToWorkspaceArgs, 'section' | 'workspaceId'>>;
  addTagToPad?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationAddTagToPadArgs, 'padId' | 'tag'>>;
  attachFileToPad?: Resolver<Maybe<ResolversTypes['Attachment']>, ParentType, ContextType, RequireFields<MutationAttachFileToPadArgs, 'handle'>>;
  claimNotebook?: Resolver<Maybe<ResolversTypes['Pad']>, ParentType, ContextType, RequireFields<MutationClaimNotebookArgs, 'notebookId'>>;
  createAnnotation?: Resolver<Maybe<ResolversTypes['Annotation']>, ParentType, ContextType, RequireFields<MutationCreateAnnotationArgs, 'blockId' | 'content' | 'padId'>>;
  createExternalDataLink?: Resolver<Maybe<ResolversTypes['ExternalDataSourceDataLink']>, ParentType, ContextType, RequireFields<MutationCreateExternalDataLinkArgs, 'externalDataId' | 'name' | 'url'>>;
  createExternalDataSource?: Resolver<Maybe<ResolversTypes['ExternalDataSource']>, ParentType, ContextType, RequireFields<MutationCreateExternalDataSourceArgs, 'dataSource'>>;
  createLogs?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationCreateLogsArgs, 'input'>>;
  createOrUpdateSnapshot?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationCreateOrUpdateSnapshotArgs, 'params'>>;
  createPad?: Resolver<ResolversTypes['Pad'], ParentType, ContextType, RequireFields<MutationCreatePadArgs, 'pad' | 'workspaceId'>>;
  createRole?: Resolver<ResolversTypes['Role'], ParentType, ContextType, RequireFields<MutationCreateRoleArgs, 'role'>>;
  createSecret?: Resolver<ResolversTypes['Secret'], ParentType, ContextType, RequireFields<MutationCreateSecretArgs, 'secret' | 'workspaceId'>>;
  createSnapshot?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationCreateSnapshotArgs, 'notebookId'>>;
  createUserViaMagicLink?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationCreateUserViaMagicLinkArgs, 'email'>>;
  createWorkspace?: Resolver<ResolversTypes['Workspace'], ParentType, ContextType, RequireFields<MutationCreateWorkspaceArgs, 'workspace'>>;
  deleteAnnotation?: Resolver<Maybe<ResolversTypes['Annotation']>, ParentType, ContextType, RequireFields<MutationDeleteAnnotationArgs, 'id'>>;
  doNothing?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  duplicatePad?: Resolver<ResolversTypes['Pad'], ParentType, ContextType, RequireFields<MutationDuplicatePadArgs, 'id' | 'targetWorkspace'>>;
  getCreateAttachmentForm?: Resolver<ResolversTypes['CreateAttachmentForm'], ParentType, ContextType, RequireFields<MutationGetCreateAttachmentFormArgs, 'fileName' | 'fileType' | 'padId'>>;
  importPad?: Resolver<ResolversTypes['Pad'], ParentType, ContextType, RequireFields<MutationImportPadArgs, 'source' | 'workspaceId'>>;
  incrementQueryCount?: Resolver<ResolversTypes['WorkspaceExecutedQuery'], ParentType, ContextType, RequireFields<MutationIncrementQueryCountArgs, 'id'>>;
  inviteUserToRole?: Resolver<Array<ResolversTypes['RoleInvitation']>, ParentType, ContextType, RequireFields<MutationInviteUserToRoleArgs, 'permission' | 'roleId' | 'userId'>>;
  movePad?: Resolver<ResolversTypes['Pad'], ParentType, ContextType, RequireFields<MutationMovePadArgs, 'id' | 'workspaceId'>>;
  removeAttachmentFromPad?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationRemoveAttachmentFromPadArgs, 'attachmentId'>>;
  removeExternalDataSource?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationRemoveExternalDataSourceArgs, 'id'>>;
  removePad?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationRemovePadArgs, 'id'>>;
  removeRole?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationRemoveRoleArgs, 'roleId'>>;
  removeSecret?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationRemoveSecretArgs, 'secretId'>>;
  removeSectionFromWorkspace?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationRemoveSectionFromWorkspaceArgs, 'sectionId' | 'workspaceId'>>;
  removeSelfFromRole?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationRemoveSelfFromRoleArgs, 'roleId'>>;
  removeTagFromPad?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationRemoveTagFromPadArgs, 'padId' | 'tag'>>;
  removeUserFromRole?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationRemoveUserFromRoleArgs, 'roleId' | 'userId'>>;
  removeWorkspace?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationRemoveWorkspaceArgs, 'id'>>;
  resendRegistrationMagicLinkEmail?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationResendRegistrationMagicLinkEmailArgs, 'email'>>;
  setPadPublic?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationSetPadPublicArgs, 'id' | 'publishState'>>;
  setUsername?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationSetUsernameArgs, 'props'>>;
  shareExternalDataSourceWithEmail?: Resolver<Maybe<ResolversTypes['ExternalDataSource']>, ParentType, ContextType, RequireFields<MutationShareExternalDataSourceWithEmailArgs, 'email' | 'id' | 'permissionType'>>;
  shareExternalDataSourceWithRole?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationShareExternalDataSourceWithRoleArgs, 'id' | 'permissionType' | 'roleId'>>;
  shareExternalDataSourceWithUser?: Resolver<Maybe<ResolversTypes['ExternalDataSource']>, ParentType, ContextType, RequireFields<MutationShareExternalDataSourceWithUserArgs, 'id' | 'permissionType' | 'userId'>>;
  sharePadWithEmail?: Resolver<ResolversTypes['Pad'], ParentType, ContextType, RequireFields<MutationSharePadWithEmailArgs, 'canComment' | 'email' | 'id' | 'permissionType'>>;
  sharePadWithRole?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationSharePadWithRoleArgs, 'canComment' | 'id' | 'permissionType' | 'roleId'>>;
  sharePadWithSecret?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationSharePadWithSecretArgs, 'canComment' | 'id' | 'permissionType'>>;
  sharePadWithUser?: Resolver<Maybe<ResolversTypes['Pad']>, ParentType, ContextType, RequireFields<MutationSharePadWithUserArgs, 'canComment' | 'id' | 'permissionType' | 'userId'>>;
  shareWorkspaceWithEmail?: Resolver<ResolversTypes['Workspace'], ParentType, ContextType, RequireFields<MutationShareWorkspaceWithEmailArgs, 'canComment' | 'email' | 'id' | 'permissionType'>>;
  syncWorkspaceSeats?: Resolver<ResolversTypes['WorkspaceSubscription'], ParentType, ContextType, RequireFields<MutationSyncWorkspaceSeatsArgs, 'id'>>;
  unshareExternalDataSourceWithRole?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationUnshareExternalDataSourceWithRoleArgs, 'id' | 'roleId'>>;
  unshareExternalDataSourceWithUser?: Resolver<ResolversTypes['ExternalDataSource'], ParentType, ContextType, RequireFields<MutationUnshareExternalDataSourceWithUserArgs, 'id' | 'userId'>>;
  unshareNotebookWithSecret?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationUnshareNotebookWithSecretArgs, 'id' | 'secret'>>;
  unsharePadWithRole?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationUnsharePadWithRoleArgs, 'id' | 'roleId'>>;
  unsharePadWithUser?: Resolver<Maybe<ResolversTypes['Pad']>, ParentType, ContextType, RequireFields<MutationUnsharePadWithUserArgs, 'id' | 'userId'>>;
  unshareWorkspaceWithUser?: Resolver<Maybe<ResolversTypes['Workspace']>, ParentType, ContextType, RequireFields<MutationUnshareWorkspaceWithUserArgs, 'id' | 'userId'>>;
  updateAnnotation?: Resolver<Maybe<ResolversTypes['Annotation']>, ParentType, ContextType, RequireFields<MutationUpdateAnnotationArgs, 'content' | 'id'>>;
  updateExternalDataSource?: Resolver<Maybe<ResolversTypes['ExternalDataSource']>, ParentType, ContextType, RequireFields<MutationUpdateExternalDataSourceArgs, 'dataSource' | 'id'>>;
  updateExtraAiAllowance?: Resolver<Maybe<ResolversTypes['NewResourceQuotaLimit']>, ParentType, ContextType, RequireFields<MutationUpdateExtraAiAllowanceArgs, 'paymentMethodId' | 'resourceId' | 'resourceType'>>;
  updatePad?: Resolver<ResolversTypes['Pad'], ParentType, ContextType, RequireFields<MutationUpdatePadArgs, 'id' | 'pad'>>;
  updateSecret?: Resolver<ResolversTypes['Secret'], ParentType, ContextType, RequireFields<MutationUpdateSecretArgs, 'secret' | 'secretId'>>;
  updateSectionInWorkspace?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationUpdateSectionInWorkspaceArgs, 'section' | 'sectionId' | 'workspaceId'>>;
  updateSelf?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationUpdateSelfArgs, 'props'>>;
  updateWorkspace?: Resolver<ResolversTypes['Workspace'], ParentType, ContextType, RequireFields<MutationUpdateWorkspaceArgs, 'id' | 'workspace'>>;
};

export type NewResourceQuotaLimitResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['NewResourceQuotaLimit'] = ResolversParentTypes['NewResourceQuotaLimit']> = {
  newQuotaLimit?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PadResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['Pad'] = ResolversParentTypes['Pad']> = {
  access?: Resolver<ResolversTypes['ResourceAccess'], ParentType, ContextType>;
  archived?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  attachments?: Resolver<Array<ResolversTypes['Attachment']>, ParentType, ContextType>;
  banned?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  canPublicDuplicate?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  document?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  gist?: Resolver<Maybe<ResolversTypes['Gist']>, ParentType, ContextType>;
  icon?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  initialState?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isPublic?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isTemplate?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  myPermissionType?: Resolver<Maybe<ResolversTypes['PermissionType']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  padConnectionParams?: Resolver<ResolversTypes['PadConnectionParams'], ParentType, ContextType>;
  section?: Resolver<Maybe<ResolversTypes['Section']>, ParentType, ContextType>;
  sectionId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  snapshots?: Resolver<Array<ResolversTypes['PadSnapshot']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tags?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  userAllowsPublicHighlighting?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  workspace?: Resolver<Maybe<ResolversTypes['Workspace']>, ParentType, ContextType>;
  workspaceId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PadChangesResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['PadChanges'] = ResolversParentTypes['PadChanges']> = {
  added?: Resolver<Array<ResolversTypes['Pad']>, ParentType, ContextType>;
  removed?: Resolver<Array<ResolversTypes['ID']>, ParentType, ContextType>;
  updated?: Resolver<Array<ResolversTypes['Pad']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PadConnectionParamsResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['PadConnectionParams'] = ResolversParentTypes['PadConnectionParams']> = {
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PadSnapshotResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['PadSnapshot'] = ResolversParentTypes['PadSnapshot']> = {
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  data?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  snapshotName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  version?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PageableResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['Pageable'] = ResolversParentTypes['Pageable']> = {
  __resolveType: TypeResolveFn<'SharedResource', ParentType, ContextType>;
};

export type PagedPadResultResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['PagedPadResult'] = ResolversParentTypes['PagedPadResult']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  cursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['Pad']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PagedResultResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['PagedResult'] = ResolversParentTypes['PagedResult']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  cursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['Pageable']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PagedTemplateSearchResultResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['PagedTemplateSearchResult'] = ResolversParentTypes['PagedTemplateSearchResult']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  cursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['TemplateSearchResult']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PermissionResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['Permission'] = ResolversParentTypes['Permission']> = {
  canComment?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  givenBy?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  resource?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['PermissionType'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  featuredPad?: Resolver<Maybe<ResolversTypes['Pad']>, ParentType, ContextType>;
  getAnnotationsByPadId?: Resolver<Maybe<Array<Maybe<ResolversTypes['Annotation']>>>, ParentType, ContextType, RequireFields<QueryGetAnnotationsByPadIdArgs, 'padId'>>;
  getCreditsPlans?: Resolver<Maybe<ResolversTypes['CreditsPlan']>, ParentType, ContextType>;
  getExternalDataSource?: Resolver<ResolversTypes['ExternalDataSource'], ParentType, ContextType, RequireFields<QueryGetExternalDataSourceArgs, 'id'>>;
  getExternalDataSources?: Resolver<Array<ResolversTypes['ExternalDataSource']>, ParentType, ContextType, RequireFields<QueryGetExternalDataSourcesArgs, 'notebookId'>>;
  getExternalDataSourcesWorkspace?: Resolver<Array<ResolversTypes['ExternalDataSource']>, ParentType, ContextType, RequireFields<QueryGetExternalDataSourcesWorkspaceArgs, 'workspaceId'>>;
  getPadById?: Resolver<Maybe<ResolversTypes['Pad']>, ParentType, ContextType, RequireFields<QueryGetPadByIdArgs, 'id'>>;
  getStripeCheckoutSessionInfo?: Resolver<Maybe<ResolversTypes['CheckoutSessionInfo']>, ParentType, ContextType, RequireFields<QueryGetStripeCheckoutSessionInfoArgs, 'priceId' | 'workspaceId'>>;
  getSubscriptionsPlans?: Resolver<Maybe<Array<Maybe<ResolversTypes['SubscriptionPlan']>>>, ParentType, ContextType>;
  getWorkspaceById?: Resolver<Maybe<ResolversTypes['Workspace']>, ParentType, ContextType, RequireFields<QueryGetWorkspaceByIdArgs, 'id'>>;
  getWorkspaceSecrets?: Resolver<Array<ResolversTypes['Secret']>, ParentType, ContextType, RequireFields<QueryGetWorkspaceSecretsArgs, 'workspaceId'>>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  pads?: Resolver<ResolversTypes['PagedPadResult'], ParentType, ContextType, RequireFields<QueryPadsArgs, 'page' | 'workspaceId'>>;
  padsByTag?: Resolver<ResolversTypes['PagedPadResult'], ParentType, ContextType, RequireFields<QueryPadsByTagArgs, 'page' | 'tag' | 'workspaceId'>>;
  padsSharedWithMe?: Resolver<ResolversTypes['PagedPadResult'], ParentType, ContextType, RequireFields<QueryPadsSharedWithMeArgs, 'page'>>;
  publiclyHighlightedPads?: Resolver<ResolversTypes['PagedPadResult'], ParentType, ContextType, RequireFields<QueryPubliclyHighlightedPadsArgs, 'page'>>;
  searchTemplates?: Resolver<ResolversTypes['PagedTemplateSearchResult'], ParentType, ContextType, RequireFields<QuerySearchTemplatesArgs, 'page' | 'prompt'>>;
  sections?: Resolver<Array<ResolversTypes['Section']>, ParentType, ContextType, RequireFields<QuerySectionsArgs, 'workspaceId'>>;
  self?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  tags?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType, RequireFields<QueryTagsArgs, 'workspaceId'>>;
  version?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  workspaces?: Resolver<Array<ResolversTypes['Workspace']>, ParentType, ContextType>;
};

export type ResourceAccessResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['ResourceAccess'] = ResolversParentTypes['ResourceAccess']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  roles?: Resolver<Array<ResolversTypes['RoleAccess']>, ParentType, ContextType>;
  users?: Resolver<Array<ResolversTypes['UserAccess']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ResourceUsageResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['ResourceUsage'] = ResolversParentTypes['ResourceUsage']> = {
  consumption?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  originalAmount?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  resourceType?: Resolver<ResolversTypes['ResourceTypes'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RoleResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['Role'] = ResolversParentTypes['Role']> = {
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  users?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  workspace?: Resolver<ResolversTypes['Workspace'], ParentType, ContextType>;
  workspaceId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RoleAccessResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['RoleAccess'] = ResolversParentTypes['RoleAccess']> = {
  canComment?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  permission?: Resolver<ResolversTypes['PermissionType'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  roleId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RoleInvitationResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['RoleInvitation'] = ResolversParentTypes['RoleInvitation']> = {
  expires_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SecretResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['Secret'] = ResolversParentTypes['Secret']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  workspace?: Resolver<Maybe<ResolversTypes['Workspace']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SecretAccessResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['SecretAccess'] = ResolversParentTypes['SecretAccess']> = {
  canComment?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  permission?: Resolver<ResolversTypes['PermissionType'], ParentType, ContextType>;
  secret?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SectionResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['Section'] = ResolversParentTypes['Section']> = {
  color?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  pads?: Resolver<Array<ResolversTypes['Pad']>, ParentType, ContextType>;
  workspace_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SectionChangesResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['SectionChanges'] = ResolversParentTypes['SectionChanges']> = {
  added?: Resolver<Array<ResolversTypes['Section']>, ParentType, ContextType>;
  removed?: Resolver<Array<ResolversTypes['ID']>, ParentType, ContextType>;
  updated?: Resolver<Array<ResolversTypes['Section']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ShareInvitationResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['ShareInvitation'] = ResolversParentTypes['ShareInvitation']> = {
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ShareWithEmailInputResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['ShareWithEmailInput'] = ResolversParentTypes['ShareWithEmailInput']> = {
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  permissionType?: Resolver<ResolversTypes['PermissionType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ShareWithRoleInputResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['ShareWithRoleInput'] = ResolversParentTypes['ShareWithRoleInput']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  permissionType?: Resolver<ResolversTypes['PermissionType'], ParentType, ContextType>;
  roleId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ShareWithSecretInputResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['ShareWithSecretInput'] = ResolversParentTypes['ShareWithSecretInput']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  permissionType?: Resolver<ResolversTypes['PermissionType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ShareWithUserInputResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['ShareWithUserInput'] = ResolversParentTypes['ShareWithUserInput']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  permissionType?: Resolver<ResolversTypes['PermissionType'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SharedResourceResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['SharedResource'] = ResolversParentTypes['SharedResource']> = {
  canComment?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  permission?: Resolver<ResolversTypes['PermissionType'], ParentType, ContextType>;
  resource?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SharedWithResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['SharedWith'] = ResolversParentTypes['SharedWith']> = {
  pendingInvitations?: Resolver<Array<ResolversTypes['ShareInvitation']>, ParentType, ContextType>;
  roles?: Resolver<Array<ResolversTypes['SharedWithRole']>, ParentType, ContextType>;
  users?: Resolver<Array<ResolversTypes['SharedWithUser']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SharedWithRoleResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['SharedWithRole'] = ResolversParentTypes['SharedWithRole']> = {
  canComment?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  permissionType?: Resolver<ResolversTypes['PermissionType'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SharedWithUserResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['SharedWithUser'] = ResolversParentTypes['SharedWithUser']> = {
  canComment?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  permissionType?: Resolver<ResolversTypes['PermissionType'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  hello?: SubscriptionResolver<Maybe<ResolversTypes['String']>, "hello", ParentType, ContextType>;
  padsChanged?: SubscriptionResolver<ResolversTypes['PadChanges'], "padsChanged", ParentType, ContextType, RequireFields<SubscriptionPadsChangedArgs, 'workspaceId'>>;
  sectionsChanged?: SubscriptionResolver<ResolversTypes['SectionChanges'], "sectionsChanged", ParentType, ContextType, RequireFields<SubscriptionSectionsChangedArgs, 'workspaceId'>>;
  subscribeToNothing?: SubscriptionResolver<Maybe<ResolversTypes['Boolean']>, "subscribeToNothing", ParentType, ContextType>;
  tagsChanged?: SubscriptionResolver<ResolversTypes['TagChanges'], "tagsChanged", ParentType, ContextType, RequireFields<SubscriptionTagsChangedArgs, 'workspaceId'>>;
  workspacesChanged?: SubscriptionResolver<ResolversTypes['WorkspacesChanges'], "workspacesChanged", ParentType, ContextType>;
};

export type SubscriptionPlanResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['SubscriptionPlan'] = ResolversParentTypes['SubscriptionPlan']> = {
  credits?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  currency?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isDefault?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  paymentLink?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  price?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  pricePerSeat?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  queries?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  seats?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  storage?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TagChangesResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['TagChanges'] = ResolversParentTypes['TagChanges']> = {
  added?: Resolver<Array<ResolversTypes['TagRecord']>, ParentType, ContextType>;
  removed?: Resolver<Array<ResolversTypes['TagRecord']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TagRecordResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['TagRecord'] = ResolversParentTypes['TagRecord']> = {
  tag?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  workspaceId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TemplateSearchResultResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['TemplateSearchResult'] = ResolversParentTypes['TemplateSearchResult']> = {
  notebook?: Resolver<ResolversTypes['TemplateSearchResultNotebook'], ParentType, ContextType>;
  summary?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TemplateSearchResultNotebookResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['TemplateSearchResultNotebook'] = ResolversParentTypes['TemplateSearchResultNotebook']> = {
  icon?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UnshareWithRoleInputResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['UnshareWithRoleInput'] = ResolversParentTypes['UnshareWithRoleInput']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  roleId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UnshareWithUserInputResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['UnshareWithUserInput'] = ResolversParentTypes['UnshareWithUserInput']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emailValidatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  onboarded?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  resourceUsages?: Resolver<Maybe<Array<Maybe<ResolversTypes['ResourceUsage']>>>, ParentType, ContextType>;
  username?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserAccessResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['UserAccess'] = ResolversParentTypes['UserAccess']> = {
  canComment?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  permission?: Resolver<ResolversTypes['PermissionType'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  userId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WorkspaceResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['Workspace'] = ResolversParentTypes['Workspace']> = {
  access?: Resolver<Maybe<ResolversTypes['WorkspaceAccess']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isPremium?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isPublic?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  membersCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  myPermissionType?: Resolver<Maybe<ResolversTypes['PermissionType']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  pads?: Resolver<ResolversTypes['PagedPadResult'], ParentType, ContextType, RequireFields<WorkspacePadsArgs, 'page'>>;
  plan?: Resolver<Maybe<ResolversTypes['SubscriptionPlansNames']>, ParentType, ContextType>;
  resourceUsages?: Resolver<Maybe<Array<Maybe<ResolversTypes['ResourceUsage']>>>, ParentType, ContextType>;
  roles?: Resolver<Maybe<Array<ResolversTypes['Role']>>, ParentType, ContextType>;
  secrets?: Resolver<Array<ResolversTypes['Secret']>, ParentType, ContextType>;
  sections?: Resolver<Array<ResolversTypes['Section']>, ParentType, ContextType>;
  workspaceExecutedQuery?: Resolver<Maybe<ResolversTypes['WorkspaceExecutedQuery']>, ParentType, ContextType>;
  workspaceSubscription?: Resolver<Maybe<ResolversTypes['WorkspaceSubscription']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WorkspaceAccessResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['WorkspaceAccess'] = ResolversParentTypes['WorkspaceAccess']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  roles?: Resolver<Maybe<Array<ResolversTypes['RoleAccess']>>, ParentType, ContextType>;
  users?: Resolver<Maybe<Array<ResolversTypes['UserAccess']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WorkspaceExecutedQueryResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['WorkspaceExecutedQuery'] = ResolversParentTypes['WorkspaceExecutedQuery']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  queryCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  query_reset_date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  quotaLimit?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  workspace?: Resolver<Maybe<ResolversTypes['Workspace']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WorkspaceSubscriptionResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['WorkspaceSubscription'] = ResolversParentTypes['WorkspaceSubscription']> = {
  credits?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  paymentStatus?: Resolver<ResolversTypes['SubscriptionPaymentStatus'], ParentType, ContextType>;
  queries?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  seats?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['SubscriptionStatus']>, ParentType, ContextType>;
  storage?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  workspace?: Resolver<Maybe<ResolversTypes['Workspace']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WorkspacesChangesResolvers<ContextType = GraphqlContext, ParentType extends ResolversParentTypes['WorkspacesChanges'] = ResolversParentTypes['WorkspacesChanges']> = {
  added?: Resolver<Array<ResolversTypes['Workspace']>, ParentType, ContextType>;
  removed?: Resolver<Array<ResolversTypes['ID']>, ParentType, ContextType>;
  updated?: Resolver<Array<ResolversTypes['Workspace']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = GraphqlContext> = {
  Annotation?: AnnotationResolvers<ContextType>;
  AnnotationUser?: AnnotationUserResolvers<ContextType>;
  Attachment?: AttachmentResolvers<ContextType>;
  CheckoutSessionInfo?: CheckoutSessionInfoResolvers<ContextType>;
  CreateAttachmentForm?: CreateAttachmentFormResolvers<ContextType>;
  CreditPricePlan?: CreditPricePlanResolvers<ContextType>;
  CreditsPlan?: CreditsPlanResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  ExternalDataSource?: ExternalDataSourceResolvers<ContextType>;
  ExternalDataSourceDataLink?: ExternalDataSourceDataLinkResolvers<ContextType>;
  ExternalKey?: ExternalKeyResolvers<ContextType>;
  KeyValue?: KeyValueResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  NewResourceQuotaLimit?: NewResourceQuotaLimitResolvers<ContextType>;
  Pad?: PadResolvers<ContextType>;
  PadChanges?: PadChangesResolvers<ContextType>;
  PadConnectionParams?: PadConnectionParamsResolvers<ContextType>;
  PadSnapshot?: PadSnapshotResolvers<ContextType>;
  Pageable?: PageableResolvers<ContextType>;
  PagedPadResult?: PagedPadResultResolvers<ContextType>;
  PagedResult?: PagedResultResolvers<ContextType>;
  PagedTemplateSearchResult?: PagedTemplateSearchResultResolvers<ContextType>;
  Permission?: PermissionResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  ResourceAccess?: ResourceAccessResolvers<ContextType>;
  ResourceUsage?: ResourceUsageResolvers<ContextType>;
  Role?: RoleResolvers<ContextType>;
  RoleAccess?: RoleAccessResolvers<ContextType>;
  RoleInvitation?: RoleInvitationResolvers<ContextType>;
  Secret?: SecretResolvers<ContextType>;
  SecretAccess?: SecretAccessResolvers<ContextType>;
  Section?: SectionResolvers<ContextType>;
  SectionChanges?: SectionChangesResolvers<ContextType>;
  ShareInvitation?: ShareInvitationResolvers<ContextType>;
  ShareWithEmailInput?: ShareWithEmailInputResolvers<ContextType>;
  ShareWithRoleInput?: ShareWithRoleInputResolvers<ContextType>;
  ShareWithSecretInput?: ShareWithSecretInputResolvers<ContextType>;
  ShareWithUserInput?: ShareWithUserInputResolvers<ContextType>;
  SharedResource?: SharedResourceResolvers<ContextType>;
  SharedWith?: SharedWithResolvers<ContextType>;
  SharedWithRole?: SharedWithRoleResolvers<ContextType>;
  SharedWithUser?: SharedWithUserResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  SubscriptionPlan?: SubscriptionPlanResolvers<ContextType>;
  TagChanges?: TagChangesResolvers<ContextType>;
  TagRecord?: TagRecordResolvers<ContextType>;
  TemplateSearchResult?: TemplateSearchResultResolvers<ContextType>;
  TemplateSearchResultNotebook?: TemplateSearchResultNotebookResolvers<ContextType>;
  UnshareWithRoleInput?: UnshareWithRoleInputResolvers<ContextType>;
  UnshareWithUserInput?: UnshareWithUserInputResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserAccess?: UserAccessResolvers<ContextType>;
  Workspace?: WorkspaceResolvers<ContextType>;
  WorkspaceAccess?: WorkspaceAccessResolvers<ContextType>;
  WorkspaceExecutedQuery?: WorkspaceExecutedQueryResolvers<ContextType>;
  WorkspaceSubscription?: WorkspaceSubscriptionResolvers<ContextType>;
  WorkspacesChanges?: WorkspacesChangesResolvers<ContextType>;
};

