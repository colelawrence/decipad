import { cacheExchange } from '@urql/exchange-graphcache';
import { Resolver as GraphCacheResolver, UpdateResolver as GraphCacheUpdateResolver, OptimisticMutationResolver as GraphCacheOptimisticMutationResolver } from '@urql/exchange-graphcache';

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
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
};

export type Annotation = {
  __typename?: 'Annotation';
  alias?: Maybe<PadAlias>;
  alias_id?: Maybe<Scalars['String']['output']>;
  block_id: Scalars['String']['output'];
  content: Scalars['String']['output'];
  dateCreated: Scalars['Float']['output'];
  dateUpdated?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  meta?: Maybe<Scalars['String']['output']>;
  pad_id: Scalars['String']['output'];
  scenario_id?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
  user?: Maybe<AnnotationUser>;
  user_id?: Maybe<Scalars['String']['output']>;
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
  padId?: Maybe<Scalars['String']['output']>;
  resource?: Maybe<AttachmentResource>;
  resourceId: Scalars['String']['output'];
  resourceType: AttachmentOwnership;
  uploadedBy?: Maybe<User>;
  url: Scalars['String']['output'];
  userId?: Maybe<Scalars['String']['output']>;
};

export type AttachmentOwnership =
  | 'PAD'
  | 'WORKSPACE';

export type AttachmentResource = Pad | Workspace;

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
  access?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  lastError?: Maybe<Scalars['String']['output']>;
  lastUsedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type ExternalProvider =
  | 'bigquery'
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
  addAlias: PadAlias;
  addAttachmentToPad?: Maybe<Attachment>;
  addNotebookToSection?: Maybe<Scalars['Boolean']['output']>;
  addSectionToWorkspace?: Maybe<Section>;
  addTagToPad?: Maybe<Scalars['Boolean']['output']>;
  attachFileToPad?: Maybe<Attachment>;
  attachFileToWorkspace?: Maybe<Attachment>;
  claimNotebook?: Maybe<Pad>;
  createAnnotation?: Maybe<Annotation>;
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
  getCreateAttachmentFormWorkspace: CreateAttachmentForm;
  importPad: Pad;
  incrementQueryCount: WorkspaceExecutedQuery;
  incrementResourceUsage?: Maybe<ResourceUsage>;
  inviteUserToRole: Array<RoleInvitation>;
  movePad: Pad;
  recordPadEvent?: Maybe<Scalars['Boolean']['output']>;
  refreshExternalDataToken: Scalars['String']['output'];
  removeAlias?: Maybe<Scalars['Boolean']['output']>;
  removeAttachmentFromPad?: Maybe<Scalars['Boolean']['output']>;
  removeAttachmentFromWorkspace?: Maybe<AttachmentResource>;
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
  undeleteAttachment?: Maybe<Scalars['Boolean']['output']>;
  unsafeDevOnlyPermissionOverride: Scalars['Boolean']['output'];
  unsafeDevOnlyPlanOverride: Scalars['Boolean']['output'];
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


export type MutationAddAliasArgs = {
  alias: Scalars['String']['input'];
  padId: Scalars['ID']['input'];
};


export type MutationAddAttachmentToPadArgs = {
  attachmentId: Scalars['ID']['input'];
  padId: Scalars['ID']['input'];
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


export type MutationAttachFileToWorkspaceArgs = {
  handle: Scalars['ID']['input'];
};


export type MutationClaimNotebookArgs = {
  notebookId: Scalars['ID']['input'];
};


export type MutationCreateAnnotationArgs = {
  aliasId?: InputMaybe<Scalars['String']['input']>;
  blockId: Scalars['String']['input'];
  content: Scalars['String']['input'];
  meta?: InputMaybe<Scalars['String']['input']>;
  padId: Scalars['String']['input'];
  scenarioId?: InputMaybe<Scalars['String']['input']>;
  type: Scalars['String']['input'];
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


export type MutationGetCreateAttachmentFormWorkspaceArgs = {
  fileName: Scalars['String']['input'];
  fileType: Scalars['String']['input'];
  workspaceId: Scalars['ID']['input'];
};


export type MutationImportPadArgs = {
  source: Scalars['String']['input'];
  workspaceId: Scalars['ID']['input'];
};


export type MutationIncrementQueryCountArgs = {
  id: Scalars['ID']['input'];
};


export type MutationIncrementResourceUsageArgs = {
  amount: Scalars['Int']['input'];
  resourceType: ResourceTypes;
  workspaceId: Scalars['String']['input'];
};


export type MutationInviteUserToRoleArgs = {
  permission: PermissionType;
  roleId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationMovePadArgs = {
  fromWorkspaceId?: InputMaybe<Scalars['ID']['input']>;
  id: Scalars['ID']['input'];
  workspaceId: Scalars['ID']['input'];
};


export type MutationRecordPadEventArgs = {
  aliasId: Scalars['ID']['input'];
  meta?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  padId: Scalars['ID']['input'];
};


export type MutationRefreshExternalDataTokenArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRemoveAliasArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRemoveAttachmentFromPadArgs = {
  attachmentId: Scalars['ID']['input'];
};


export type MutationRemoveAttachmentFromWorkspaceArgs = {
  attachmentId: Scalars['ID']['input'];
};


export type MutationRemoveExternalDataSourceArgs = {
  id: Scalars['ID']['input'];
  workspaceId?: InputMaybe<Scalars['ID']['input']>;
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


export type MutationUndeleteAttachmentArgs = {
  attachmentId: Scalars['ID']['input'];
};


export type MutationUnsafeDevOnlyPermissionOverrideArgs = {
  id: Scalars['String']['input'];
  permissionType?: InputMaybe<PermissionType>;
  resourceType: ExternalDataSourceOwnership;
};


export type MutationUnsafeDevOnlyPlanOverrideArgs = {
  plan?: InputMaybe<SubscriptionPlansNames>;
  workspaceId: Scalars['String']['input'];
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
  aliases: Array<PadAlias>;
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
  numberFormatting?: Maybe<Scalars['String']['output']>;
  padConnectionParams: PadConnectionParams;
  section?: Maybe<Section>;
  sectionId?: Maybe<Scalars['ID']['output']>;
  snapshots: Array<PadSnapshot>;
  status?: Maybe<Scalars['String']['output']>;
  tags: Array<Scalars['String']['output']>;
  userConsentToFeatureOnGallery?: Maybe<Scalars['Boolean']['output']>;
  workspace?: Maybe<Workspace>;
  workspaceId?: Maybe<Scalars['ID']['output']>;
};

export type PadAlias = {
  __typename?: 'PadAlias';
  alias: Scalars['String']['output'];
  annotations?: Maybe<Array<Annotation>>;
  events?: Maybe<Array<PadEvent>>;
  id: Scalars['ID']['output'];
  pad_id: Scalars['ID']['output'];
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

export type PadEvent = {
  __typename?: 'PadEvent';
  alias_id: Scalars['ID']['output'];
  created_at: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  meta?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type PadInput = {
  archived?: InputMaybe<Scalars['Boolean']['input']>;
  canPublicDuplicate?: InputMaybe<Scalars['Boolean']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  isTemplate?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  numberFormatting?: InputMaybe<Scalars['String']['input']>;
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
  getAliasesByPadId?: Maybe<Array<PadAlias>>;
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


export type QueryGetAliasesByPadIdArgs = {
  padId: Scalars['String']['input'];
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
  | 'queries'
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
  resourceId?: Maybe<Scalars['ID']['output']>;
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
  editors?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  isDefault?: Maybe<Scalars['Boolean']['output']>;
  key: Scalars['String']['output'];
  paymentLink?: Maybe<Scalars['String']['output']>;
  price?: Maybe<Scalars['Int']['output']>;
  queries?: Maybe<Scalars['Int']['output']>;
  readers?: Maybe<Scalars['Int']['output']>;
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
  resourceId?: Maybe<Scalars['ID']['output']>;
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
  attachments: Array<Attachment>;
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
  credits: Scalars['Int']['output'];
  editors?: Maybe<Scalars['Int']['output']>;
  id: Scalars['String']['output'];
  paymentStatus: SubscriptionPaymentStatus;
  queries: Scalars['Int']['output'];
  readers?: Maybe<Scalars['Int']['output']>;
  seats?: Maybe<Scalars['Int']['output']>;
  status?: Maybe<SubscriptionStatus>;
  storage: Scalars['Int']['output'];
  workspace?: Maybe<Workspace>;
};

export type WorkspacesChanges = {
  __typename?: 'WorkspacesChanges';
  added: Array<Workspace>;
  removed: Array<Scalars['ID']['output']>;
  updated: Array<Workspace>;
};

export type AddAliasMutationVariables = Exact<{
  alias: Scalars['String']['input'];
  padId: Scalars['ID']['input'];
}>;


export type AddAliasMutation = { __typename?: 'Mutation', addAlias: { __typename?: 'PadAlias', id: string, alias: string, pad_id: string } };

export type AttachFileToNotebookMutationVariables = Exact<{
  handle: Scalars['ID']['input'];
}>;


export type AttachFileToNotebookMutation = { __typename?: 'Mutation', attachFileToPad?: { __typename?: 'Attachment', id: string, padId?: string | null, fileName: string, fileType: string, fileSize: number, url: string } | null };

export type AddAttachmentToNotebookMutationVariables = Exact<{
  attachmentId: Scalars['ID']['input'];
  notebookId: Scalars['ID']['input'];
}>;


export type AddAttachmentToNotebookMutation = { __typename?: 'Mutation', addAttachmentToPad?: { __typename?: 'Attachment', id: string, url: string } | null };

export type RemoveFileFromNotebookMutationVariables = Exact<{
  attachmentId: Scalars['ID']['input'];
}>;


export type RemoveFileFromNotebookMutation = { __typename?: 'Mutation', removeAttachmentFromPad?: boolean | null };

export type UndeleteFileFromNotebookMutationVariables = Exact<{
  attachmentId: Scalars['ID']['input'];
}>;


export type UndeleteFileFromNotebookMutation = { __typename?: 'Mutation', undeleteAttachment?: boolean | null };

export type GetCreateAttachmentFormWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  fileName: Scalars['String']['input'];
  fileType: Scalars['String']['input'];
}>;


export type GetCreateAttachmentFormWorkspaceMutation = { __typename?: 'Mutation', getCreateAttachmentFormWorkspace: { __typename?: 'CreateAttachmentForm', url: string, handle: string, fields: Array<{ __typename?: 'KeyValue', key: string, value: string }> } };

export type AttachFileToWorkspaceMutationVariables = Exact<{
  handle: Scalars['ID']['input'];
}>;


export type AttachFileToWorkspaceMutation = { __typename?: 'Mutation', attachFileToWorkspace?: { __typename?: 'Attachment', id: string, fileName: string, fileType: string, fileSize: number, url: string, resource?: { __typename?: 'Pad', id: string, attachments: Array<{ __typename?: 'Attachment', id: string, fileName: string, fileType: string, fileSize: number, userId?: string | null, createdAt?: any | null, url: string }> } | { __typename?: 'Workspace', id: string, attachments: Array<{ __typename?: 'Attachment', id: string, fileName: string, fileType: string, fileSize: number, userId?: string | null, createdAt?: any | null, url: string }> } | null } | null };

export type RemoveFileFromWorkspaceMutationVariables = Exact<{
  attachmentId: Scalars['ID']['input'];
}>;


export type RemoveFileFromWorkspaceMutation = { __typename?: 'Mutation', removeAttachmentFromWorkspace?: { __typename?: 'Pad' } | { __typename?: 'Workspace', id: string, attachments: Array<{ __typename?: 'Attachment', id: string, fileName: string, fileType: string, fileSize: number, userId?: string | null, createdAt?: any | null, url: string }> } | null };

export type ChangeWorkspaceAccessLevelMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  email: Scalars['String']['input'];
  permissionType: PermissionType;
  canComment: Scalars['Boolean']['input'];
}>;


export type ChangeWorkspaceAccessLevelMutation = { __typename?: 'Mutation', shareWorkspaceWithEmail: { __typename?: 'Workspace', id: string, access?: { __typename?: 'WorkspaceAccess', id: string, users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user?: { __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null, emailValidatedAt?: any | null } | null }> | null, roles?: Array<{ __typename?: 'RoleAccess', permission: PermissionType, role: { __typename?: 'Role', id: string } }> | null } | null } };

export type ClaimNotebookMutationVariables = Exact<{
  notebookId: Scalars['ID']['input'];
}>;


export type ClaimNotebookMutation = { __typename?: 'Mutation', claimNotebook?: { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, numberFormatting?: string | null, status?: string | null, isPublic?: boolean | null, createdAt: any, archived?: boolean | null, gist?: Gist | null, canPublicDuplicate?: boolean | null, initialState?: string | null, sectionId?: string | null, workspaceId?: string | null, workspace?: { __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null, plan?: SubscriptionPlansNames | null, workspaceSubscription?: { __typename?: 'WorkspaceSubscription', id: string, credits: number, queries: number, storage: number, seats?: number | null } | null } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, attachments: Array<{ __typename?: 'Attachment', id: string, fileName: string, fileType: string, fileSize: number, url: string }> } | null };

export type CreateAnnotationMutationVariables = Exact<{
  content: Scalars['String']['input'];
  type: Scalars['String']['input'];
  padId: Scalars['String']['input'];
  blockId: Scalars['String']['input'];
  aliasId?: InputMaybe<Scalars['String']['input']>;
  meta?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateAnnotationMutation = { __typename?: 'Mutation', createAnnotation?: { __typename?: 'Annotation', id: string, content: string, type: string, pad_id: string, alias_id?: string | null, block_id: string, dateCreated: number, dateUpdated?: number | null, user?: { __typename?: 'AnnotationUser', id: string, username: string, avatar?: string | null } | null } | null };

export type CreateExternalDataSourceMutationVariables = Exact<{
  dataSource: ExternalDataSourceCreateInput;
}>;


export type CreateExternalDataSourceMutation = { __typename?: 'Mutation', createExternalDataSource?: { __typename?: 'ExternalDataSource', id: string, dataSourceName?: string | null, name: string, owner: ExternalDataSourceOwnership, ownerId: string, provider: ExternalProvider, dataUrl?: string | null, authUrl?: string | null, externalId?: string | null, keys: Array<{ __typename?: 'ExternalKey', id: string, access?: string | null, lastError?: string | null, createdAt: any, expiresAt?: any | null, lastUsedAt?: any | null }> } | null };

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


export type CreateNotebookMutation = { __typename?: 'Mutation', createPad: { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, numberFormatting?: string | null, status?: string | null, isPublic?: boolean | null, createdAt: any, archived?: boolean | null, gist?: Gist | null, canPublicDuplicate?: boolean | null, initialState?: string | null, sectionId?: string | null, workspaceId?: string | null, workspace?: { __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null, plan?: SubscriptionPlansNames | null, workspaceSubscription?: { __typename?: 'WorkspaceSubscription', id: string, credits: number, queries: number, storage: number, seats?: number | null } | null } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, attachments: Array<{ __typename?: 'Attachment', id: string, fileName: string, fileType: string, fileSize: number, url: string }> } };

export type CreateSectionMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  color: Scalars['String']['input'];
}>;


export type CreateSectionMutation = { __typename?: 'Mutation', addSectionToWorkspace?: { __typename?: 'Section', id: string, name: string, color: string, createdAt?: any | null } | null };

export type CreateNotebookSnapshotMutationVariables = Exact<{
  notebookId: Scalars['ID']['input'];
}>;


export type CreateNotebookSnapshotMutation = { __typename?: 'Mutation', createSnapshot: boolean };

export type CreateOrUpdateNotebookSnapshotMutationVariables = Exact<{
  params: CreateOrUpdateSnapshotInput;
}>;


export type CreateOrUpdateNotebookSnapshotMutation = { __typename?: 'Mutation', createOrUpdateSnapshot: boolean };

export type CreateWorkspaceMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type CreateWorkspaceMutation = { __typename?: 'Mutation', createWorkspace: { __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null, plan?: SubscriptionPlansNames | null, createdAt?: any | null, membersCount?: number | null, myPermissionType?: PermissionType | null, workspaceSubscription?: { __typename?: 'WorkspaceSubscription', id: string, paymentStatus: SubscriptionPaymentStatus, credits: number, queries: number, seats?: number | null, editors?: number | null, readers?: number | null, storage: number } | null, sections: Array<{ __typename?: 'Section', id: string, name: string, color: string, createdAt?: any | null }>, resourceUsages?: Array<{ __typename?: 'ResourceUsage', id: string, resourceType: ResourceTypes, consumption: number, originalAmount?: number | null } | null> | null, access?: { __typename?: 'WorkspaceAccess', id: string, users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user?: { __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null, emailValidatedAt?: any | null } | null }> | null, roles?: Array<{ __typename?: 'RoleAccess', permission: PermissionType, role: { __typename?: 'Role', id: string } }> | null } | null } };

export type CreateWorkspaceSecretMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  secret: SecretInput;
}>;


export type CreateWorkspaceSecretMutation = { __typename?: 'Mutation', createSecret: { __typename?: 'Secret', id: string, name: string } };

export type DeleteAliasMutationVariables = Exact<{
  aliasId: Scalars['ID']['input'];
}>;


export type DeleteAliasMutation = { __typename?: 'Mutation', removeAlias?: boolean | null };

export type DeleteAnnotationMutationVariables = Exact<{
  annotationId: Scalars['String']['input'];
}>;


export type DeleteAnnotationMutation = { __typename?: 'Mutation', deleteAnnotation?: { __typename?: 'Annotation', id: string, type: string, content: string, alias_id?: string | null, pad_id: string, block_id: string, dateCreated: number, dateUpdated?: number | null } | null };

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

export type DeleteExternalDataMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  workspaceId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type DeleteExternalDataMutation = { __typename?: 'Mutation', removeExternalDataSource?: boolean | null };

export type DeleteWorkspaceSecretMutationVariables = Exact<{
  secretId: Scalars['ID']['input'];
}>;


export type DeleteWorkspaceSecretMutation = { __typename?: 'Mutation', removeSecret: boolean };

export type DuplicateNotebookMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  targetWorkspace: Scalars['ID']['input'];
  document?: InputMaybe<Scalars['String']['input']>;
}>;


export type DuplicateNotebookMutation = { __typename?: 'Mutation', duplicatePad: { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, numberFormatting?: string | null, status?: string | null, isPublic?: boolean | null, createdAt: any, archived?: boolean | null, gist?: Gist | null, canPublicDuplicate?: boolean | null, initialState?: string | null, sectionId?: string | null, workspaceId?: string | null, workspace?: { __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null, plan?: SubscriptionPlansNames | null, workspaceSubscription?: { __typename?: 'WorkspaceSubscription', id: string, credits: number, queries: number, storage: number, seats?: number | null } | null } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, attachments: Array<{ __typename?: 'Attachment', id: string, fileName: string, fileType: string, fileSize: number, url: string }> } };

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


export type ImportNotebookMutation = { __typename?: 'Mutation', importPad: { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, numberFormatting?: string | null, status?: string | null, isPublic?: boolean | null, createdAt: any, archived?: boolean | null, gist?: Gist | null, canPublicDuplicate?: boolean | null, initialState?: string | null, sectionId?: string | null, workspaceId?: string | null, workspace?: { __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null, plan?: SubscriptionPlansNames | null, workspaceSubscription?: { __typename?: 'WorkspaceSubscription', id: string, credits: number, queries: number, storage: number, seats?: number | null } | null } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, attachments: Array<{ __typename?: 'Attachment', id: string, fileName: string, fileType: string, fileSize: number, url: string }> } };

export type MoveNotebookMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  workspaceId: Scalars['ID']['input'];
  fromWorkspaceId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type MoveNotebookMutation = { __typename?: 'Mutation', movePad: { __typename?: 'Pad', id: string, workspaceId?: string | null } };

export type RecordPadEventMutationVariables = Exact<{
  padId: Scalars['ID']['input'];
  aliasId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  meta?: InputMaybe<Scalars['String']['input']>;
}>;


export type RecordPadEventMutation = { __typename?: 'Mutation', recordPadEvent?: boolean | null };

export type RefreshKeyMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type RefreshKeyMutation = { __typename?: 'Mutation', refreshExternalDataToken: string };

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

export type SetNotebookPublishStateMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  publishState: Publish_State;
}>;


export type SetNotebookPublishStateMutation = { __typename?: 'Mutation', setPadPublic: boolean };

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


export type SharePadWithEmailMutation = { __typename?: 'Mutation', sharePadWithEmail: { __typename?: 'Pad', id: string, name: string, access: { __typename?: 'ResourceAccess', id: string, users: Array<{ __typename?: 'UserAccess', permission: PermissionType, canComment: boolean, user?: { __typename?: 'User', id: string, image?: string | null, name: string, email?: string | null, username?: string | null, onboarded?: boolean | null, emailValidatedAt?: any | null } | null }> } } };

export type ShareWorkspaceWithEmailMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  email: Scalars['String']['input'];
  permissionType: PermissionType;
  canComment: Scalars['Boolean']['input'];
}>;


export type ShareWorkspaceWithEmailMutation = { __typename?: 'Mutation', shareWorkspaceWithEmail: { __typename?: 'Workspace', id: string, access?: { __typename?: 'WorkspaceAccess', id: string, users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user?: { __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null, emailValidatedAt?: any | null } | null }> | null, roles?: Array<{ __typename?: 'RoleAccess', permission: PermissionType, role: { __typename?: 'Role', id: string } }> | null } | null } };

export type UnarchiveNotebookMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UnarchiveNotebookMutation = { __typename?: 'Mutation', updatePad: { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, numberFormatting?: string | null, status?: string | null, isPublic?: boolean | null, createdAt: any, archived?: boolean | null, gist?: Gist | null, canPublicDuplicate?: boolean | null, initialState?: string | null, workspace?: { __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null, plan?: SubscriptionPlansNames | null, workspaceSubscription?: { __typename?: 'WorkspaceSubscription', id: string, credits: number, queries: number, storage: number, seats?: number | null } | null } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, attachments: Array<{ __typename?: 'Attachment', id: string, fileName: string, fileType: string, fileSize: number, url: string }> } };

export type UnsafePermissionsMutationVariables = Exact<{
  id: Scalars['String']['input'];
  permissionType?: InputMaybe<PermissionType>;
  resourceType: ExternalDataSourceOwnership;
}>;


export type UnsafePermissionsMutation = { __typename?: 'Mutation', unsafeDevOnlyPermissionOverride: boolean };

export type UnsafePlanMutationVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  plan?: InputMaybe<SubscriptionPlansNames>;
}>;


export type UnsafePlanMutation = { __typename?: 'Mutation', unsafeDevOnlyPlanOverride: boolean };

export type UnshareNotebookWithSecretMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  secret: Scalars['String']['input'];
}>;


export type UnshareNotebookWithSecretMutation = { __typename?: 'Mutation', unshareNotebookWithSecret?: boolean | null };

export type UnsharePadWithUserMutationVariables = Exact<{
  padId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
}>;


export type UnsharePadWithUserMutation = { __typename?: 'Mutation', unsharePadWithUser?: { __typename?: 'Pad', id: string, name: string, access: { __typename?: 'ResourceAccess', id: string, users: Array<{ __typename?: 'UserAccess', permission: PermissionType, canComment: boolean, user?: { __typename?: 'User', id: string, image?: string | null, name: string, email?: string | null, username?: string | null, onboarded?: boolean | null, emailValidatedAt?: any | null } | null }> } } | null };

export type UnshareWorkspaceWithUserMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
}>;


export type UnshareWorkspaceWithUserMutation = { __typename?: 'Mutation', unshareWorkspaceWithUser?: { __typename?: 'Workspace', id: string, access?: { __typename?: 'WorkspaceAccess', id: string, users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user?: { __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null, emailValidatedAt?: any | null } | null }> | null, roles?: Array<{ __typename?: 'RoleAccess', permission: PermissionType, role: { __typename?: 'Role', id: string } }> | null } | null } | null };

export type UpdateExternalDataMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  dataSource: ExternalDataSourceUpdateInput;
}>;


export type UpdateExternalDataMutation = { __typename?: 'Mutation', updateExternalDataSource?: { __typename?: 'ExternalDataSource', id: string } | null };

export type UpdateNotebookArchiveMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UpdateNotebookArchiveMutation = { __typename?: 'Mutation', updatePad: { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, numberFormatting?: string | null, status?: string | null, isPublic?: boolean | null, createdAt: any, archived?: boolean | null, gist?: Gist | null, canPublicDuplicate?: boolean | null, initialState?: string | null, workspace?: { __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null, plan?: SubscriptionPlansNames | null, workspaceSubscription?: { __typename?: 'WorkspaceSubscription', id: string, credits: number, queries: number, storage: number, seats?: number | null } | null } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, attachments: Array<{ __typename?: 'Attachment', id: string, fileName: string, fileType: string, fileSize: number, url: string }> } };

export type UpdateNotebookIconMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  icon: Scalars['String']['input'];
}>;


export type UpdateNotebookIconMutation = { __typename?: 'Mutation', updatePad: { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, numberFormatting?: string | null, status?: string | null, isPublic?: boolean | null, createdAt: any, archived?: boolean | null, gist?: Gist | null, canPublicDuplicate?: boolean | null, initialState?: string | null, workspace?: { __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null, plan?: SubscriptionPlansNames | null, workspaceSubscription?: { __typename?: 'WorkspaceSubscription', id: string, credits: number, queries: number, storage: number, seats?: number | null } | null } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, attachments: Array<{ __typename?: 'Attachment', id: string, fileName: string, fileType: string, fileSize: number, url: string }> } };

export type UpdateNotebookNumberFormattingMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  numberFormatting: Scalars['String']['input'];
}>;


export type UpdateNotebookNumberFormattingMutation = { __typename?: 'Mutation', updatePad: { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, numberFormatting?: string | null, status?: string | null, isPublic?: boolean | null, createdAt: any, archived?: boolean | null, gist?: Gist | null, canPublicDuplicate?: boolean | null, initialState?: string | null, workspace?: { __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null, plan?: SubscriptionPlansNames | null, workspaceSubscription?: { __typename?: 'WorkspaceSubscription', id: string, credits: number, queries: number, storage: number, seats?: number | null } | null } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, attachments: Array<{ __typename?: 'Attachment', id: string, fileName: string, fileType: string, fileSize: number, url: string }> } };

export type UpdateNotebookStatusMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  status: Scalars['String']['input'];
}>;


export type UpdateNotebookStatusMutation = { __typename?: 'Mutation', updatePad: { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, numberFormatting?: string | null, status?: string | null, isPublic?: boolean | null, createdAt: any, archived?: boolean | null, gist?: Gist | null, canPublicDuplicate?: boolean | null, initialState?: string | null, workspace?: { __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null, plan?: SubscriptionPlansNames | null, workspaceSubscription?: { __typename?: 'WorkspaceSubscription', id: string, credits: number, queries: number, storage: number, seats?: number | null } | null } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, attachments: Array<{ __typename?: 'Attachment', id: string, fileName: string, fileType: string, fileSize: number, url: string }> } };

export type UpdateNotebookAllowDuplicateMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  allowDuplicate: Scalars['Boolean']['input'];
}>;


export type UpdateNotebookAllowDuplicateMutation = { __typename?: 'Mutation', updatePad: { __typename?: 'Pad', id: string, canPublicDuplicate?: boolean | null } };

export type UpdatePadPermissionMutationVariables = Exact<{
  padId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
  permissionType: PermissionType;
  canComment: Scalars['Boolean']['input'];
}>;


export type UpdatePadPermissionMutation = { __typename?: 'Mutation', unsharePadWithUser?: { __typename?: 'Pad', id: string, name: string, access: { __typename?: 'ResourceAccess', id: string, users: Array<{ __typename?: 'UserAccess', permission: PermissionType, canComment: boolean, user?: { __typename?: 'User', id: string, image?: string | null, name: string, email?: string | null, username?: string | null, onboarded?: boolean | null, emailValidatedAt?: any | null } | null }> } } | null, sharePadWithUser?: { __typename?: 'Pad', id: string, name: string, access: { __typename?: 'ResourceAccess', id: string, users: Array<{ __typename?: 'UserAccess', permission: PermissionType, canComment: boolean, user?: { __typename?: 'User', id: string, image?: string | null, name: string, email?: string | null, username?: string | null, onboarded?: boolean | null, emailValidatedAt?: any | null } | null }> } } | null };

export type UpdateResourceQuotaLimitMutationVariables = Exact<{
  resourceType: Scalars['String']['input'];
  resourceId: Scalars['String']['input'];
  paymentMethodId: Scalars['String']['input'];
}>;


export type UpdateResourceQuotaLimitMutation = { __typename?: 'Mutation', updateExtraAiAllowance?: { __typename?: 'NewResourceQuotaLimit', newQuotaLimit: number } | null };

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


export type UpdateUserMutation = { __typename?: 'Mutation', updateSelf: { __typename?: 'User', name: string, description?: string | null, onboarded?: boolean | null } };

export type IncrementResourceUsageMutationVariables = Exact<{
  resourceType: ResourceTypes;
  workspaceId: Scalars['String']['input'];
  amount: Scalars['Int']['input'];
}>;


export type IncrementResourceUsageMutation = { __typename?: 'Mutation', incrementResourceUsage?: { __typename?: 'ResourceUsage', id: string, resourceType: ResourceTypes, consumption: number } | null };

export type GetCreditsPlansQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCreditsPlansQuery = { __typename?: 'Query', getCreditsPlans?: { __typename?: 'CreditsPlan', id: string, title?: string | null, description?: string | null, plans: Array<{ __typename?: 'CreditPricePlan', id: string, title?: string | null, description?: string | null, price: number, credits: number, isDefault?: boolean | null, promotionTag?: string | null, currency: string }> } | null };

export type ExternalDataSourceFragmentFragment = { __typename?: 'ExternalDataSource', id: string, dataSourceName?: string | null, name: string, owner: ExternalDataSourceOwnership, ownerId: string, provider: ExternalProvider, dataUrl?: string | null, authUrl?: string | null, externalId?: string | null, keys: Array<{ __typename?: 'ExternalKey', id: string, access?: string | null, lastError?: string | null, createdAt: any, expiresAt?: any | null, lastUsedAt?: any | null }> };

export type GetExternalDataSourcesQueryVariables = Exact<{
  notebookId: Scalars['ID']['input'];
}>;


export type GetExternalDataSourcesQuery = { __typename?: 'Query', getExternalDataSources: Array<{ __typename?: 'ExternalDataSource', id: string, dataSourceName?: string | null, name: string, owner: ExternalDataSourceOwnership, ownerId: string, provider: ExternalProvider, dataUrl?: string | null, authUrl?: string | null, externalId?: string | null, keys: Array<{ __typename?: 'ExternalKey', id: string, access?: string | null, lastError?: string | null, createdAt: any, expiresAt?: any | null, lastUsedAt?: any | null }> }> };

export type GetExternalDataSourcesWorkspaceQueryVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
}>;


export type GetExternalDataSourcesWorkspaceQuery = { __typename?: 'Query', getExternalDataSourcesWorkspace: Array<{ __typename?: 'ExternalDataSource', id: string, dataSourceName?: string | null, name: string, owner: ExternalDataSourceOwnership, ownerId: string, provider: ExternalProvider, dataUrl?: string | null, authUrl?: string | null, externalId?: string | null, keys: Array<{ __typename?: 'ExternalKey', id: string, access?: string | null, lastError?: string | null, createdAt: any, expiresAt?: any | null, lastUsedAt?: any | null }> }> };

export type GetNotebookAliasesQueryVariables = Exact<{
  notebookId: Scalars['String']['input'];
}>;


export type GetNotebookAliasesQuery = { __typename?: 'Query', getAliasesByPadId?: Array<{ __typename?: 'PadAlias', id: string, alias: string, pad_id: string }> | null };

export type GetNotebookAnnotationsQueryVariables = Exact<{
  notebookId: Scalars['String']['input'];
}>;


export type GetNotebookAnnotationsQuery = { __typename?: 'Query', getAnnotationsByPadId?: Array<{ __typename?: 'Annotation', id: string, content: string, type: string, alias_id?: string | null, pad_id: string, meta?: string | null, block_id: string, scenario_id?: string | null, dateCreated: number, dateUpdated?: number | null, user?: { __typename?: 'AnnotationUser', id: string, username: string, avatar?: string | null } | null, alias?: { __typename?: 'PadAlias', id: string, alias: string } | null } | null> | null };

export type NotebookSnapshotFragment = { __typename?: 'PadSnapshot', snapshotName: string, createdAt?: any | null, updatedAt?: any | null, data?: string | null, version?: string | null };

export type CollaboratorFragment = { __typename?: 'User', id: string, image?: string | null, name: string, email?: string | null, username?: string | null, onboarded?: boolean | null, emailValidatedAt?: any | null };

export type WorkspaceSubscriptionDataFragment = { __typename?: 'WorkspaceSubscription', id: string, credits: number, queries: number, storage: number, seats?: number | null };

export type EditorNotebookFragment = { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, numberFormatting?: string | null, status?: string | null, isPublic?: boolean | null, createdAt: any, archived?: boolean | null, gist?: Gist | null, canPublicDuplicate?: boolean | null, initialState?: string | null, workspace?: { __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null, plan?: SubscriptionPlansNames | null, workspaceSubscription?: { __typename?: 'WorkspaceSubscription', id: string, credits: number, queries: number, storage: number, seats?: number | null } | null } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, attachments: Array<{ __typename?: 'Attachment', id: string, fileName: string, fileType: string, fileSize: number, url: string }> };

export type GetNotebookByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  snapshotName?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetNotebookByIdQuery = { __typename?: 'Query', getPadById?: { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, numberFormatting?: string | null, status?: string | null, isPublic?: boolean | null, createdAt: any, archived?: boolean | null, gist?: Gist | null, canPublicDuplicate?: boolean | null, initialState?: string | null, workspace?: { __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null, plan?: SubscriptionPlansNames | null, workspaceSubscription?: { __typename?: 'WorkspaceSubscription', id: string, credits: number, queries: number, storage: number, seats?: number | null } | null } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, attachments: Array<{ __typename?: 'Attachment', id: string, fileName: string, fileType: string, fileSize: number, url: string }> } | null };

export type UserAccessMetaFragment = { __typename?: 'UserAccess', permission: PermissionType, canComment: boolean, user?: { __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null } | null };

export type WorkspaceSubscriptionWithDataFragment = { __typename?: 'WorkspaceSubscription', id: string, paymentStatus: SubscriptionPaymentStatus, credits: number, queries: number, seats?: number | null, editors?: number | null, readers?: number | null, storage: number };

export type NotebookMetaDataFragment = { __typename?: 'Pad', id: string, name: string, status?: string | null, myPermissionType?: PermissionType | null, isPublic?: boolean | null, userConsentToFeatureOnGallery?: boolean | null, createdAt: any, initialState?: string | null, gist?: Gist | null, canPublicDuplicate?: boolean | null, archived?: boolean | null, aliases: Array<{ __typename?: 'PadAlias', id: string, alias: string, annotations?: Array<{ __typename?: 'Annotation', id: string, content: string, meta?: string | null }> | null, events?: Array<{ __typename?: 'PadEvent', id: string, name: string, created_at: number, meta?: string | null }> | null }>, workspace?: { __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null, plan?: SubscriptionPlansNames | null, myPermissionType?: PermissionType | null, membersCount?: number | null, access?: { __typename?: 'WorkspaceAccess', id: string, users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, canComment: boolean, user?: { __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null } | null }> | null } | null, resourceUsages?: Array<{ __typename?: 'ResourceUsage', id: string, resourceType: ResourceTypes, consumption: number } | null> | null, workspaceSubscription?: { __typename?: 'WorkspaceSubscription', id: string, paymentStatus: SubscriptionPaymentStatus, credits: number, queries: number, seats?: number | null, editors?: number | null, readers?: number | null, storage: number } | null } | null, snapshots: Array<{ __typename?: 'PadSnapshot', snapshotName: string, createdAt?: any | null, updatedAt?: any | null, version?: string | null }>, access: { __typename?: 'ResourceAccess', id: string, users: Array<{ __typename?: 'UserAccess', permission: PermissionType, canComment: boolean, user?: { __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null } | null }> } };

export type NotebookWorkspacesDataFragment = { __typename?: 'Workspace', id: string, name: string };

export type GetNotebookMetaQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetNotebookMetaQuery = { __typename?: 'Query', getPadById?: { __typename?: 'Pad', id: string, name: string, status?: string | null, myPermissionType?: PermissionType | null, isPublic?: boolean | null, userConsentToFeatureOnGallery?: boolean | null, createdAt: any, initialState?: string | null, gist?: Gist | null, canPublicDuplicate?: boolean | null, archived?: boolean | null, aliases: Array<{ __typename?: 'PadAlias', id: string, alias: string, annotations?: Array<{ __typename?: 'Annotation', id: string, content: string, meta?: string | null }> | null, events?: Array<{ __typename?: 'PadEvent', id: string, name: string, created_at: number, meta?: string | null }> | null }>, workspace?: { __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null, plan?: SubscriptionPlansNames | null, myPermissionType?: PermissionType | null, membersCount?: number | null, access?: { __typename?: 'WorkspaceAccess', id: string, users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, canComment: boolean, user?: { __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null } | null }> | null } | null, resourceUsages?: Array<{ __typename?: 'ResourceUsage', id: string, resourceType: ResourceTypes, consumption: number } | null> | null, workspaceSubscription?: { __typename?: 'WorkspaceSubscription', id: string, paymentStatus: SubscriptionPaymentStatus, credits: number, queries: number, seats?: number | null, editors?: number | null, readers?: number | null, storage: number } | null } | null, snapshots: Array<{ __typename?: 'PadSnapshot', snapshotName: string, createdAt?: any | null, updatedAt?: any | null, version?: string | null }>, access: { __typename?: 'ResourceAccess', id: string, users: Array<{ __typename?: 'UserAccess', permission: PermissionType, canComment: boolean, user?: { __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null } | null }> } } | null, workspaces: Array<{ __typename?: 'Workspace', id: string, name: string }> };

export type GetStripeCheckoutSessionInfoQueryVariables = Exact<{
  priceId: Scalars['ID']['input'];
  workspaceId: Scalars['ID']['input'];
}>;


export type GetStripeCheckoutSessionInfoQuery = { __typename?: 'Query', getStripeCheckoutSessionInfo?: { __typename?: 'CheckoutSessionInfo', id?: string | null, clientSecret?: string | null } | null };

export type SubPlansFragment = { __typename?: 'SubscriptionPlan', paymentLink?: string | null, credits?: number | null, queries?: number | null, seats?: number | null, editors?: number | null, readers?: number | null, storage?: number | null, description?: string | null, price?: number | null, currency?: string | null, title?: string | null, id: string, key: string, isDefault?: boolean | null };

export type GetSubscriptionsPlansQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSubscriptionsPlansQuery = { __typename?: 'Query', getSubscriptionsPlans?: Array<{ __typename?: 'SubscriptionPlan', paymentLink?: string | null, credits?: number | null, queries?: number | null, seats?: number | null, editors?: number | null, readers?: number | null, storage?: number | null, description?: string | null, price?: number | null, currency?: string | null, title?: string | null, id: string, key: string, isDefault?: boolean | null } | null> | null };

export type UserQueryVariables = Exact<{ [key: string]: never; }>;


export type UserQuery = { __typename?: 'Query', self?: { __typename?: 'User', id: string, name: string, username?: string | null, description?: string | null, onboarded?: boolean | null, image?: string | null } | null };

export type WorkspaceSectionFragment = { __typename?: 'Section', id: string, name: string, color: string, createdAt?: any | null };

export type WorkspaceMembersFragment = { __typename?: 'Workspace', access?: { __typename?: 'WorkspaceAccess', id: string, users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user?: { __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null, emailValidatedAt?: any | null } | null }> | null, roles?: Array<{ __typename?: 'RoleAccess', permission: PermissionType, role: { __typename?: 'Role', id: string } }> | null } | null };

export type ShallowWorkspaceFragment = { __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null, plan?: SubscriptionPlansNames | null, createdAt?: any | null, membersCount?: number | null, myPermissionType?: PermissionType | null, workspaceSubscription?: { __typename?: 'WorkspaceSubscription', id: string, paymentStatus: SubscriptionPaymentStatus, credits: number, queries: number, seats?: number | null, editors?: number | null, readers?: number | null, storage: number } | null, sections: Array<{ __typename?: 'Section', id: string, name: string, color: string, createdAt?: any | null }>, resourceUsages?: Array<{ __typename?: 'ResourceUsage', id: string, resourceType: ResourceTypes, consumption: number, originalAmount?: number | null } | null> | null, access?: { __typename?: 'WorkspaceAccess', id: string, users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user?: { __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null, emailValidatedAt?: any | null } | null }> | null, roles?: Array<{ __typename?: 'RoleAccess', permission: PermissionType, role: { __typename?: 'Role', id: string } }> | null } | null };

export type GetWorkspacesWithoutNotebooksQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkspacesWithoutNotebooksQuery = { __typename?: 'Query', workspaces: Array<{ __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null, plan?: SubscriptionPlansNames | null, createdAt?: any | null, membersCount?: number | null, myPermissionType?: PermissionType | null, workspaceSubscription?: { __typename?: 'WorkspaceSubscription', id: string, paymentStatus: SubscriptionPaymentStatus, credits: number, queries: number, seats?: number | null, editors?: number | null, readers?: number | null, storage: number } | null, sections: Array<{ __typename?: 'Section', id: string, name: string, color: string, createdAt?: any | null }>, resourceUsages?: Array<{ __typename?: 'ResourceUsage', id: string, resourceType: ResourceTypes, consumption: number, originalAmount?: number | null } | null> | null, access?: { __typename?: 'WorkspaceAccess', id: string, users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user?: { __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null, emailValidatedAt?: any | null } | null }> | null, roles?: Array<{ __typename?: 'RoleAccess', permission: PermissionType, role: { __typename?: 'Role', id: string } }> | null } | null }> };

export type GetWorkspacesWithSharedNotebooksQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkspacesWithSharedNotebooksQuery = { __typename?: 'Query', workspaces: Array<{ __typename?: 'Workspace', id: string, name: string, isPremium?: boolean | null, plan?: SubscriptionPlansNames | null, createdAt?: any | null, membersCount?: number | null, myPermissionType?: PermissionType | null, workspaceSubscription?: { __typename?: 'WorkspaceSubscription', id: string, paymentStatus: SubscriptionPaymentStatus, credits: number, queries: number, seats?: number | null, editors?: number | null, readers?: number | null, storage: number } | null, sections: Array<{ __typename?: 'Section', id: string, name: string, color: string, createdAt?: any | null }>, resourceUsages?: Array<{ __typename?: 'ResourceUsage', id: string, resourceType: ResourceTypes, consumption: number, originalAmount?: number | null } | null> | null, access?: { __typename?: 'WorkspaceAccess', id: string, users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user?: { __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null, emailValidatedAt?: any | null } | null }> | null, roles?: Array<{ __typename?: 'RoleAccess', permission: PermissionType, role: { __typename?: 'Role', id: string } }> | null } | null }>, padsSharedWithMe: { __typename?: 'PagedPadResult', items: Array<{ __typename?: 'Pad', id: string, name: string, icon?: string | null, status?: string | null, createdAt: any, archived?: boolean | null, isPublic?: boolean | null, sectionId?: string | null, workspaceId?: string | null, myPermissionType?: PermissionType | null }> } };

export type WorkspaceSwitcherWorkspaceFragment = { __typename?: 'Workspace', id: string, name: string, myPermissionType?: PermissionType | null };

export type GetWorkspacesIDsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkspacesIDsQuery = { __typename?: 'Query', workspaces: Array<{ __typename?: 'Workspace', id: string, name: string, myPermissionType?: PermissionType | null }> };

export type AttachmentFragmentFragment = { __typename?: 'Attachment', id: string, fileName: string, fileType: string, fileSize: number, userId?: string | null, createdAt?: any | null, url: string };

export type GetWorkspaceAttachmentsQueryVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
}>;


export type GetWorkspaceAttachmentsQuery = { __typename?: 'Query', getWorkspaceById?: { __typename?: 'Workspace', id: string, attachments: Array<{ __typename?: 'Attachment', id: string, fileName: string, fileType: string, fileSize: number, userId?: string | null, createdAt?: any | null, url: string }> } | null };

export type GetWorkspaceByIdQueryVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
}>;


export type GetWorkspaceByIdQuery = { __typename?: 'Query', getWorkspaceById?: { __typename?: 'Workspace', id: string, plan?: SubscriptionPlansNames | null, isPremium?: boolean | null, workspaceSubscription?: { __typename?: 'WorkspaceSubscription', id: string, paymentStatus: SubscriptionPaymentStatus, credits: number, queries: number, seats?: number | null, editors?: number | null, readers?: number | null, storage: number } | null, resourceUsages?: Array<{ __typename?: 'ResourceUsage', id: string, resourceType: ResourceTypes, consumption: number, originalAmount?: number | null } | null> | null, access?: { __typename?: 'WorkspaceAccess', id: string, users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user?: { __typename?: 'User', id: string, name: string, email?: string | null, image?: string | null, emailValidatedAt?: any | null } | null }> | null, roles?: Array<{ __typename?: 'RoleAccess', permission: PermissionType, role: { __typename?: 'Role', id: string } }> | null } | null } | null };

export type WorkspaceNotebookFragment = { __typename?: 'Pad', id: string, name: string, icon?: string | null, status?: string | null, createdAt: any, archived?: boolean | null, isPublic?: boolean | null, sectionId?: string | null, workspaceId?: string | null, myPermissionType?: PermissionType | null };

export type GetWorkspaceNotebooksQueryVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
}>;


export type GetWorkspaceNotebooksQuery = { __typename?: 'Query', pads: { __typename?: 'PagedPadResult', count: number, hasNextPage: boolean, items: Array<{ __typename?: 'Pad', id: string, name: string, icon?: string | null, status?: string | null, createdAt: any, archived?: boolean | null, isPublic?: boolean | null, sectionId?: string | null, workspaceId?: string | null, myPermissionType?: PermissionType | null }> } };

export type GetWorkspaceSecretsQueryVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
}>;


export type GetWorkspaceSecretsQuery = { __typename?: 'Query', getWorkspaceSecrets: Array<{ __typename?: 'Secret', id: string, name: string }> };

export const ExternalDataSourceFragmentFragmentDoc = gql`
    fragment ExternalDataSourceFragment on ExternalDataSource {
  id
  dataSourceName
  name
  owner
  ownerId
  provider
  dataUrl
  authUrl
  externalId
  keys {
    id
    access
    lastError
    createdAt
    expiresAt
    lastUsedAt
  }
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
export const WorkspaceSubscriptionDataFragmentDoc = gql`
    fragment WorkspaceSubscriptionData on WorkspaceSubscription {
  id
  credits
  queries
  storage
  seats
}
    `;
export const EditorNotebookFragmentDoc = gql`
    fragment EditorNotebook on Pad {
  id
  name
  myPermissionType
  icon
  numberFormatting
  status
  isPublic
  createdAt
  archived
  gist
  canPublicDuplicate
  workspace {
    id
    name
    isPremium
    plan
    workspaceSubscription {
      ...WorkspaceSubscriptionData
    }
  }
  padConnectionParams {
    url
    token
  }
  initialState
  attachments {
    id
    fileName
    fileType
    fileSize
    url
  }
}
    ${WorkspaceSubscriptionDataFragmentDoc}`;
export const UserAccessMetaFragmentDoc = gql`
    fragment UserAccessMeta on UserAccess {
  user {
    id
    name
    email
    image
  }
  permission
  canComment
}
    `;
export const WorkspaceSubscriptionWithDataFragmentDoc = gql`
    fragment WorkspaceSubscriptionWithData on WorkspaceSubscription {
  id
  paymentStatus
  credits
  queries
  seats
  editors
  readers
  storage
}
    `;
export const NotebookMetaDataFragmentDoc = gql`
    fragment NotebookMetaData on Pad {
  id
  name
  status
  myPermissionType
  isPublic
  userConsentToFeatureOnGallery
  createdAt
  initialState
  gist
  canPublicDuplicate
  aliases {
    id
    alias
    annotations {
      id
      content
      meta
    }
    events {
      id
      name
      created_at
      meta
    }
  }
  workspace {
    id
    name
    isPremium
    plan
    myPermissionType
    access {
      id
      users {
        ...UserAccessMeta
      }
    }
    membersCount
    resourceUsages {
      id
      resourceType
      consumption
    }
    workspaceSubscription {
      ...WorkspaceSubscriptionWithData
    }
  }
  snapshots {
    snapshotName
    createdAt
    updatedAt
    version
  }
  archived
  access {
    id
    users {
      ...UserAccessMeta
    }
  }
}
    ${UserAccessMetaFragmentDoc}
${WorkspaceSubscriptionWithDataFragmentDoc}`;
export const NotebookWorkspacesDataFragmentDoc = gql`
    fragment NotebookWorkspacesData on Workspace {
  id
  name
}
    `;
export const SubPlansFragmentDoc = gql`
    fragment SubPlans on SubscriptionPlan {
  paymentLink
  credits
  queries
  seats
  editors
  readers
  storage
  description
  price
  currency
  title
  id
  key
  isDefault
}
    `;
export const WorkspaceSectionFragmentDoc = gql`
    fragment WorkspaceSection on Section {
  id
  name
  color
  createdAt
}
    `;
export const WorkspaceMembersFragmentDoc = gql`
    fragment WorkspaceMembers on Workspace {
  access {
    id
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
      }
    }
  }
}
    `;
export const ShallowWorkspaceFragmentDoc = gql`
    fragment ShallowWorkspace on Workspace {
  id
  name
  isPremium
  plan
  createdAt
  workspaceSubscription {
    ...WorkspaceSubscriptionWithData
  }
  membersCount
  sections {
    ...WorkspaceSection
  }
  ...WorkspaceMembers
  resourceUsages {
    id
    resourceType
    consumption
    originalAmount
  }
  myPermissionType
}
    ${WorkspaceSubscriptionWithDataFragmentDoc}
${WorkspaceSectionFragmentDoc}
${WorkspaceMembersFragmentDoc}`;
export const WorkspaceSwitcherWorkspaceFragmentDoc = gql`
    fragment WorkspaceSwitcherWorkspace on Workspace {
  id
  name
  myPermissionType
}
    `;
export const AttachmentFragmentFragmentDoc = gql`
    fragment AttachmentFragment on Attachment {
  id
  fileName
  fileType
  fileSize
  userId
  createdAt
  url
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
  sectionId
  workspaceId
  myPermissionType
}
    `;
export const AddAliasDocument = gql`
    mutation AddAlias($alias: String!, $padId: ID!) {
  addAlias(alias: $alias, padId: $padId) {
    id
    alias
    pad_id
  }
}
    `;

export function useAddAliasMutation() {
  return Urql.useMutation<AddAliasMutation, AddAliasMutationVariables>(AddAliasDocument);
};
export const AttachFileToNotebookDocument = gql`
    mutation AttachFileToNotebook($handle: ID!) {
  attachFileToPad(handle: $handle) {
    id
    padId
    fileName
    fileType
    fileSize
    url
  }
}
    `;

export function useAttachFileToNotebookMutation() {
  return Urql.useMutation<AttachFileToNotebookMutation, AttachFileToNotebookMutationVariables>(AttachFileToNotebookDocument);
};
export const AddAttachmentToNotebookDocument = gql`
    mutation AddAttachmentToNotebook($attachmentId: ID!, $notebookId: ID!) {
  addAttachmentToPad(attachmentId: $attachmentId, padId: $notebookId) {
    id
    url
  }
}
    `;

export function useAddAttachmentToNotebookMutation() {
  return Urql.useMutation<AddAttachmentToNotebookMutation, AddAttachmentToNotebookMutationVariables>(AddAttachmentToNotebookDocument);
};
export const RemoveFileFromNotebookDocument = gql`
    mutation RemoveFileFromNotebook($attachmentId: ID!) {
  removeAttachmentFromPad(attachmentId: $attachmentId)
}
    `;

export function useRemoveFileFromNotebookMutation() {
  return Urql.useMutation<RemoveFileFromNotebookMutation, RemoveFileFromNotebookMutationVariables>(RemoveFileFromNotebookDocument);
};
export const UndeleteFileFromNotebookDocument = gql`
    mutation UndeleteFileFromNotebook($attachmentId: ID!) {
  undeleteAttachment(attachmentId: $attachmentId)
}
    `;

export function useUndeleteFileFromNotebookMutation() {
  return Urql.useMutation<UndeleteFileFromNotebookMutation, UndeleteFileFromNotebookMutationVariables>(UndeleteFileFromNotebookDocument);
};
export const GetCreateAttachmentFormWorkspaceDocument = gql`
    mutation GetCreateAttachmentFormWorkspace($workspaceId: ID!, $fileName: String!, $fileType: String!) {
  getCreateAttachmentFormWorkspace(
    workspaceId: $workspaceId
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

export function useGetCreateAttachmentFormWorkspaceMutation() {
  return Urql.useMutation<GetCreateAttachmentFormWorkspaceMutation, GetCreateAttachmentFormWorkspaceMutationVariables>(GetCreateAttachmentFormWorkspaceDocument);
};
export const AttachFileToWorkspaceDocument = gql`
    mutation AttachFileToWorkspace($handle: ID!) {
  attachFileToWorkspace(handle: $handle) {
    id
    fileName
    fileType
    fileSize
    url
    resource {
      ... on Workspace {
        id
        attachments {
          id
          fileName
          fileType
          fileSize
          userId
          createdAt
          url
        }
      }
      ... on Pad {
        id
        attachments {
          id
          fileName
          fileType
          fileSize
          userId
          createdAt
          url
        }
      }
    }
  }
}
    `;

export function useAttachFileToWorkspaceMutation() {
  return Urql.useMutation<AttachFileToWorkspaceMutation, AttachFileToWorkspaceMutationVariables>(AttachFileToWorkspaceDocument);
};
export const RemoveFileFromWorkspaceDocument = gql`
    mutation RemoveFileFromWorkspace($attachmentId: ID!) {
  removeAttachmentFromWorkspace(attachmentId: $attachmentId) {
    ... on Workspace {
      id
      attachments {
        id
        fileName
        fileType
        fileSize
        userId
        createdAt
        url
      }
    }
  }
}
    `;

export function useRemoveFileFromWorkspaceMutation() {
  return Urql.useMutation<RemoveFileFromWorkspaceMutation, RemoveFileFromWorkspaceMutationVariables>(RemoveFileFromWorkspaceDocument);
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
export const ClaimNotebookDocument = gql`
    mutation ClaimNotebook($notebookId: ID!) {
  claimNotebook(notebookId: $notebookId) {
    ...EditorNotebook
    ...WorkspaceNotebook
  }
}
    ${EditorNotebookFragmentDoc}
${WorkspaceNotebookFragmentDoc}`;

export function useClaimNotebookMutation() {
  return Urql.useMutation<ClaimNotebookMutation, ClaimNotebookMutationVariables>(ClaimNotebookDocument);
};
export const CreateAnnotationDocument = gql`
    mutation CreateAnnotation($content: String!, $type: String!, $padId: String!, $blockId: String!, $aliasId: String, $meta: String) {
  createAnnotation(
    content: $content
    type: $type
    padId: $padId
    blockId: $blockId
    aliasId: $aliasId
    meta: $meta
  ) {
    id
    content
    type
    pad_id
    alias_id
    block_id
    dateCreated
    dateUpdated
    user {
      id
      username
      avatar
    }
  }
}
    `;

export function useCreateAnnotationMutation() {
  return Urql.useMutation<CreateAnnotationMutation, CreateAnnotationMutationVariables>(CreateAnnotationDocument);
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
export const CreateNotebookSnapshotDocument = gql`
    mutation CreateNotebookSnapshot($notebookId: ID!) {
  createSnapshot(notebookId: $notebookId)
}
    `;

export function useCreateNotebookSnapshotMutation() {
  return Urql.useMutation<CreateNotebookSnapshotMutation, CreateNotebookSnapshotMutationVariables>(CreateNotebookSnapshotDocument);
};
export const CreateOrUpdateNotebookSnapshotDocument = gql`
    mutation CreateOrUpdateNotebookSnapshot($params: CreateOrUpdateSnapshotInput!) {
  createOrUpdateSnapshot(params: $params)
}
    `;

export function useCreateOrUpdateNotebookSnapshotMutation() {
  return Urql.useMutation<CreateOrUpdateNotebookSnapshotMutation, CreateOrUpdateNotebookSnapshotMutationVariables>(CreateOrUpdateNotebookSnapshotDocument);
};
export const CreateWorkspaceDocument = gql`
    mutation CreateWorkspace($name: String!) {
  createWorkspace(workspace: {name: $name}) {
    ...ShallowWorkspace
  }
}
    ${ShallowWorkspaceFragmentDoc}`;

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
export const DeleteAliasDocument = gql`
    mutation DeleteAlias($aliasId: ID!) {
  removeAlias(id: $aliasId)
}
    `;

export function useDeleteAliasMutation() {
  return Urql.useMutation<DeleteAliasMutation, DeleteAliasMutationVariables>(DeleteAliasDocument);
};
export const DeleteAnnotationDocument = gql`
    mutation DeleteAnnotation($annotationId: String!) {
  deleteAnnotation(id: $annotationId) {
    id
    type
    content
    alias_id
    pad_id
    block_id
    dateCreated
    dateUpdated
  }
}
    `;

export function useDeleteAnnotationMutation() {
  return Urql.useMutation<DeleteAnnotationMutation, DeleteAnnotationMutationVariables>(DeleteAnnotationDocument);
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
export const DeleteExternalDataDocument = gql`
    mutation DeleteExternalData($id: ID!, $workspaceId: ID) {
  removeExternalDataSource(id: $id, workspaceId: $workspaceId)
}
    `;

export function useDeleteExternalDataMutation() {
  return Urql.useMutation<DeleteExternalDataMutation, DeleteExternalDataMutationVariables>(DeleteExternalDataDocument);
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
    mutation MoveNotebook($id: ID!, $workspaceId: ID!, $fromWorkspaceId: ID) {
  movePad(id: $id, workspaceId: $workspaceId, fromWorkspaceId: $fromWorkspaceId) {
    id
    workspaceId
  }
}
    `;

export function useMoveNotebookMutation() {
  return Urql.useMutation<MoveNotebookMutation, MoveNotebookMutationVariables>(MoveNotebookDocument);
};
export const RecordPadEventDocument = gql`
    mutation RecordPadEvent($padId: ID!, $aliasId: ID!, $name: String!, $meta: String) {
  recordPadEvent(padId: $padId, aliasId: $aliasId, name: $name, meta: $meta)
}
    `;

export function useRecordPadEventMutation() {
  return Urql.useMutation<RecordPadEventMutation, RecordPadEventMutationVariables>(RecordPadEventDocument);
};
export const RefreshKeyDocument = gql`
    mutation RefreshKey($id: ID!) {
  refreshExternalDataToken(id: $id)
}
    `;

export function useRefreshKeyMutation() {
  return Urql.useMutation<RefreshKeyMutation, RefreshKeyMutationVariables>(RefreshKeyDocument);
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
export const SetNotebookPublishStateDocument = gql`
    mutation setNotebookPublishState($id: ID!, $publishState: PUBLISH_STATE!) {
  setPadPublic(id: $id, publishState: $publishState)
}
    `;

export function useSetNotebookPublishStateMutation() {
  return Urql.useMutation<SetNotebookPublishStateMutation, SetNotebookPublishStateMutationVariables>(SetNotebookPublishStateDocument);
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
      id
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
export const UnsafePermissionsDocument = gql`
    mutation UnsafePermissions($id: String!, $permissionType: PermissionType, $resourceType: ExternalDataSourceOwnership!) {
  unsafeDevOnlyPermissionOverride(
    id: $id
    permissionType: $permissionType
    resourceType: $resourceType
  )
}
    `;

export function useUnsafePermissionsMutation() {
  return Urql.useMutation<UnsafePermissionsMutation, UnsafePermissionsMutationVariables>(UnsafePermissionsDocument);
};
export const UnsafePlanDocument = gql`
    mutation UnsafePlan($workspaceId: String!, $plan: SubscriptionPlansNames) {
  unsafeDevOnlyPlanOverride(workspaceId: $workspaceId, plan: $plan)
}
    `;

export function useUnsafePlanMutation() {
  return Urql.useMutation<UnsafePlanMutation, UnsafePlanMutationVariables>(UnsafePlanDocument);
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
      id
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
export const UpdateExternalDataDocument = gql`
    mutation UpdateExternalData($id: ID!, $dataSource: ExternalDataSourceUpdateInput!) {
  updateExternalDataSource(id: $id, dataSource: $dataSource) {
    id
  }
}
    `;

export function useUpdateExternalDataMutation() {
  return Urql.useMutation<UpdateExternalDataMutation, UpdateExternalDataMutationVariables>(UpdateExternalDataDocument);
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
export const UpdateNotebookNumberFormattingDocument = gql`
    mutation UpdateNotebookNumberFormatting($id: ID!, $numberFormatting: String!) {
  updatePad(id: $id, pad: {numberFormatting: $numberFormatting}) {
    ...EditorNotebook
  }
}
    ${EditorNotebookFragmentDoc}`;

export function useUpdateNotebookNumberFormattingMutation() {
  return Urql.useMutation<UpdateNotebookNumberFormattingMutation, UpdateNotebookNumberFormattingMutationVariables>(UpdateNotebookNumberFormattingDocument);
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
export const UpdateNotebookAllowDuplicateDocument = gql`
    mutation UpdateNotebookAllowDuplicate($id: ID!, $allowDuplicate: Boolean!) {
  updatePad(id: $id, pad: {canPublicDuplicate: $allowDuplicate}) {
    id
    canPublicDuplicate
  }
}
    `;

export function useUpdateNotebookAllowDuplicateMutation() {
  return Urql.useMutation<UpdateNotebookAllowDuplicateMutation, UpdateNotebookAllowDuplicateMutationVariables>(UpdateNotebookAllowDuplicateDocument);
};
export const UpdatePadPermissionDocument = gql`
    mutation updatePadPermission($padId: ID!, $userId: ID!, $permissionType: PermissionType!, $canComment: Boolean!) {
  unsharePadWithUser(id: $padId, userId: $userId) {
    id
    name
    access {
      id
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
      id
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
export const UpdateResourceQuotaLimitDocument = gql`
    mutation UpdateResourceQuotaLimit($resourceType: String!, $resourceId: String!, $paymentMethodId: String!) {
  updateExtraAiAllowance(
    resourceType: $resourceType
    resourceId: $resourceId
    paymentMethodId: $paymentMethodId
  ) {
    newQuotaLimit
  }
}
    `;

export function useUpdateResourceQuotaLimitMutation() {
  return Urql.useMutation<UpdateResourceQuotaLimitMutation, UpdateResourceQuotaLimitMutationVariables>(UpdateResourceQuotaLimitDocument);
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
    onboarded
  }
}
    `;

export function useUpdateUserMutation() {
  return Urql.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(UpdateUserDocument);
};
export const IncrementResourceUsageDocument = gql`
    mutation IncrementResourceUsage($resourceType: ResourceTypes!, $workspaceId: String!, $amount: Int!) {
  incrementResourceUsage(
    resourceType: $resourceType
    workspaceId: $workspaceId
    amount: $amount
  ) {
    id
    resourceType
    consumption
  }
}
    `;

export function useIncrementResourceUsageMutation() {
  return Urql.useMutation<IncrementResourceUsageMutation, IncrementResourceUsageMutationVariables>(IncrementResourceUsageDocument);
};
export const GetCreditsPlansDocument = gql`
    query GetCreditsPlans {
  getCreditsPlans {
    id
    title
    description
    plans {
      id
      title
      description
      price
      credits
      isDefault
      promotionTag
      currency
    }
  }
}
    `;

export function useGetCreditsPlansQuery(options?: Omit<Urql.UseQueryArgs<GetCreditsPlansQueryVariables>, 'query'>) {
  return Urql.useQuery<GetCreditsPlansQuery, GetCreditsPlansQueryVariables>({ query: GetCreditsPlansDocument, ...options });
};
export const GetExternalDataSourcesDocument = gql`
    query GetExternalDataSources($notebookId: ID!) {
  getExternalDataSources(notebookId: $notebookId) {
    ...ExternalDataSourceFragment
  }
}
    ${ExternalDataSourceFragmentFragmentDoc}`;

export function useGetExternalDataSourcesQuery(options: Omit<Urql.UseQueryArgs<GetExternalDataSourcesQueryVariables>, 'query'>) {
  return Urql.useQuery<GetExternalDataSourcesQuery, GetExternalDataSourcesQueryVariables>({ query: GetExternalDataSourcesDocument, ...options });
};
export const GetExternalDataSourcesWorkspaceDocument = gql`
    query GetExternalDataSourcesWorkspace($workspaceId: ID!) {
  getExternalDataSourcesWorkspace(workspaceId: $workspaceId) {
    ...ExternalDataSourceFragment
  }
}
    ${ExternalDataSourceFragmentFragmentDoc}`;

export function useGetExternalDataSourcesWorkspaceQuery(options: Omit<Urql.UseQueryArgs<GetExternalDataSourcesWorkspaceQueryVariables>, 'query'>) {
  return Urql.useQuery<GetExternalDataSourcesWorkspaceQuery, GetExternalDataSourcesWorkspaceQueryVariables>({ query: GetExternalDataSourcesWorkspaceDocument, ...options });
};
export const GetNotebookAliasesDocument = gql`
    query GetNotebookAliases($notebookId: String!) {
  getAliasesByPadId(padId: $notebookId) {
    id
    alias
    pad_id
  }
}
    `;

export function useGetNotebookAliasesQuery(options: Omit<Urql.UseQueryArgs<GetNotebookAliasesQueryVariables>, 'query'>) {
  return Urql.useQuery<GetNotebookAliasesQuery, GetNotebookAliasesQueryVariables>({ query: GetNotebookAliasesDocument, ...options });
};
export const GetNotebookAnnotationsDocument = gql`
    query GetNotebookAnnotations($notebookId: String!) {
  getAnnotationsByPadId(padId: $notebookId) {
    id
    content
    type
    alias_id
    pad_id
    meta
    block_id
    scenario_id
    dateCreated
    dateUpdated
    user {
      id
      username
      avatar
    }
    alias {
      id
      alias
    }
  }
}
    `;

export function useGetNotebookAnnotationsQuery(options: Omit<Urql.UseQueryArgs<GetNotebookAnnotationsQueryVariables>, 'query'>) {
  return Urql.useQuery<GetNotebookAnnotationsQuery, GetNotebookAnnotationsQueryVariables>({ query: GetNotebookAnnotationsDocument, ...options });
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
export const GetNotebookMetaDocument = gql`
    query GetNotebookMeta($id: ID!) {
  getPadById(id: $id) {
    ...NotebookMetaData
  }
  workspaces {
    ...NotebookWorkspacesData
  }
}
    ${NotebookMetaDataFragmentDoc}
${NotebookWorkspacesDataFragmentDoc}`;

export function useGetNotebookMetaQuery(options: Omit<Urql.UseQueryArgs<GetNotebookMetaQueryVariables>, 'query'>) {
  return Urql.useQuery<GetNotebookMetaQuery, GetNotebookMetaQueryVariables>({ query: GetNotebookMetaDocument, ...options });
};
export const GetStripeCheckoutSessionInfoDocument = gql`
    query getStripeCheckoutSessionInfo($priceId: ID!, $workspaceId: ID!) {
  getStripeCheckoutSessionInfo(priceId: $priceId, workspaceId: $workspaceId) {
    id
    clientSecret
  }
}
    `;

export function useGetStripeCheckoutSessionInfoQuery(options: Omit<Urql.UseQueryArgs<GetStripeCheckoutSessionInfoQueryVariables>, 'query'>) {
  return Urql.useQuery<GetStripeCheckoutSessionInfoQuery, GetStripeCheckoutSessionInfoQueryVariables>({ query: GetStripeCheckoutSessionInfoDocument, ...options });
};
export const GetSubscriptionsPlansDocument = gql`
    query GetSubscriptionsPlans {
  getSubscriptionsPlans {
    ...SubPlans
  }
}
    ${SubPlansFragmentDoc}`;

export function useGetSubscriptionsPlansQuery(options?: Omit<Urql.UseQueryArgs<GetSubscriptionsPlansQueryVariables>, 'query'>) {
  return Urql.useQuery<GetSubscriptionsPlansQuery, GetSubscriptionsPlansQueryVariables>({ query: GetSubscriptionsPlansDocument, ...options });
};
export const UserDocument = gql`
    query User {
  self {
    id
    name
    username
    description
    onboarded
    image
  }
}
    `;

export function useUserQuery(options?: Omit<Urql.UseQueryArgs<UserQueryVariables>, 'query'>) {
  return Urql.useQuery<UserQuery, UserQueryVariables>({ query: UserDocument, ...options });
};
export const GetWorkspacesWithoutNotebooksDocument = gql`
    query GetWorkspacesWithoutNotebooks {
  workspaces {
    ...ShallowWorkspace
  }
}
    ${ShallowWorkspaceFragmentDoc}`;

export function useGetWorkspacesWithoutNotebooksQuery(options?: Omit<Urql.UseQueryArgs<GetWorkspacesWithoutNotebooksQueryVariables>, 'query'>) {
  return Urql.useQuery<GetWorkspacesWithoutNotebooksQuery, GetWorkspacesWithoutNotebooksQueryVariables>({ query: GetWorkspacesWithoutNotebooksDocument, ...options });
};
export const GetWorkspacesWithSharedNotebooksDocument = gql`
    query GetWorkspacesWithSharedNotebooks {
  workspaces {
    ...ShallowWorkspace
  }
  padsSharedWithMe(page: {maxItems: 10000}) {
    items {
      ...WorkspaceNotebook
    }
  }
}
    ${ShallowWorkspaceFragmentDoc}
${WorkspaceNotebookFragmentDoc}`;

export function useGetWorkspacesWithSharedNotebooksQuery(options?: Omit<Urql.UseQueryArgs<GetWorkspacesWithSharedNotebooksQueryVariables>, 'query'>) {
  return Urql.useQuery<GetWorkspacesWithSharedNotebooksQuery, GetWorkspacesWithSharedNotebooksQueryVariables>({ query: GetWorkspacesWithSharedNotebooksDocument, ...options });
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
export const GetWorkspaceAttachmentsDocument = gql`
    query GetWorkspaceAttachments($workspaceId: ID!) {
  getWorkspaceById(id: $workspaceId) {
    id
    attachments {
      ...AttachmentFragment
    }
  }
}
    ${AttachmentFragmentFragmentDoc}`;

export function useGetWorkspaceAttachmentsQuery(options: Omit<Urql.UseQueryArgs<GetWorkspaceAttachmentsQueryVariables>, 'query'>) {
  return Urql.useQuery<GetWorkspaceAttachmentsQuery, GetWorkspaceAttachmentsQueryVariables>({ query: GetWorkspaceAttachmentsDocument, ...options });
};
export const GetWorkspaceByIdDocument = gql`
    query GetWorkspaceById($workspaceId: ID!) {
  getWorkspaceById(id: $workspaceId) {
    id
    plan
    isPremium
    workspaceSubscription {
      ...WorkspaceSubscriptionWithData
    }
    resourceUsages {
      id
      resourceType
      consumption
      originalAmount
    }
    ...WorkspaceMembers
  }
}
    ${WorkspaceSubscriptionWithDataFragmentDoc}
${WorkspaceMembersFragmentDoc}`;

export function useGetWorkspaceByIdQuery(options: Omit<Urql.UseQueryArgs<GetWorkspaceByIdQueryVariables>, 'query'>) {
  return Urql.useQuery<GetWorkspaceByIdQuery, GetWorkspaceByIdQueryVariables>({ query: GetWorkspaceByIdDocument, ...options });
};
export const GetWorkspaceNotebooksDocument = gql`
    query GetWorkspaceNotebooks($workspaceId: ID!) {
  pads(workspaceId: $workspaceId, page: {maxItems: 10000}) {
    items {
      ...WorkspaceNotebook
    }
    count
    hasNextPage
  }
}
    ${WorkspaceNotebookFragmentDoc}`;

export function useGetWorkspaceNotebooksQuery(options: Omit<Urql.UseQueryArgs<GetWorkspaceNotebooksQueryVariables>, 'query'>) {
  return Urql.useQuery<GetWorkspaceNotebooksQuery, GetWorkspaceNotebooksQueryVariables>({ query: GetWorkspaceNotebooksDocument, ...options });
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
  Annotation?: (data: WithTypename<Annotation>) => null | string,
  AnnotationUser?: (data: WithTypename<AnnotationUser>) => null | string,
  Attachment?: (data: WithTypename<Attachment>) => null | string,
  CheckoutSessionInfo?: (data: WithTypename<CheckoutSessionInfo>) => null | string,
  CreateAttachmentForm?: (data: WithTypename<CreateAttachmentForm>) => null | string,
  CreditPricePlan?: (data: WithTypename<CreditPricePlan>) => null | string,
  CreditsPlan?: (data: WithTypename<CreditsPlan>) => null | string,
  ExternalDataSource?: (data: WithTypename<ExternalDataSource>) => null | string,
  ExternalKey?: (data: WithTypename<ExternalKey>) => null | string,
  KeyValue?: (data: WithTypename<KeyValue>) => null | string,
  NewResourceQuotaLimit?: (data: WithTypename<NewResourceQuotaLimit>) => null | string,
  Pad?: (data: WithTypename<Pad>) => null | string,
  PadAlias?: (data: WithTypename<PadAlias>) => null | string,
  PadChanges?: (data: WithTypename<PadChanges>) => null | string,
  PadConnectionParams?: (data: WithTypename<PadConnectionParams>) => null | string,
  PadEvent?: (data: WithTypename<PadEvent>) => null | string,
  PadSnapshot?: (data: WithTypename<PadSnapshot>) => null | string,
  PagedPadResult?: (data: WithTypename<PagedPadResult>) => null | string,
  PagedResult?: (data: WithTypename<PagedResult>) => null | string,
  PagedTemplateSearchResult?: (data: WithTypename<PagedTemplateSearchResult>) => null | string,
  Permission?: (data: WithTypename<Permission>) => null | string,
  ResourceAccess?: (data: WithTypename<ResourceAccess>) => null | string,
  ResourceUsage?: (data: WithTypename<ResourceUsage>) => null | string,
  Role?: (data: WithTypename<Role>) => null | string,
  RoleAccess?: (data: WithTypename<RoleAccess>) => null | string,
  RoleInvitation?: (data: WithTypename<RoleInvitation>) => null | string,
  Secret?: (data: WithTypename<Secret>) => null | string,
  SecretAccess?: (data: WithTypename<SecretAccess>) => null | string,
  Section?: (data: WithTypename<Section>) => null | string,
  SectionChanges?: (data: WithTypename<SectionChanges>) => null | string,
  ShareInvitation?: (data: WithTypename<ShareInvitation>) => null | string,
  ShareWithEmailInput?: (data: WithTypename<ShareWithEmailInput>) => null | string,
  ShareWithRoleInput?: (data: WithTypename<ShareWithRoleInput>) => null | string,
  ShareWithSecretInput?: (data: WithTypename<ShareWithSecretInput>) => null | string,
  ShareWithUserInput?: (data: WithTypename<ShareWithUserInput>) => null | string,
  SharedResource?: (data: WithTypename<SharedResource>) => null | string,
  SharedWith?: (data: WithTypename<SharedWith>) => null | string,
  SharedWithRole?: (data: WithTypename<SharedWithRole>) => null | string,
  SharedWithUser?: (data: WithTypename<SharedWithUser>) => null | string,
  SubscriptionPlan?: (data: WithTypename<SubscriptionPlan>) => null | string,
  TagChanges?: (data: WithTypename<TagChanges>) => null | string,
  TagRecord?: (data: WithTypename<TagRecord>) => null | string,
  TemplateSearchResult?: (data: WithTypename<TemplateSearchResult>) => null | string,
  TemplateSearchResultNotebook?: (data: WithTypename<TemplateSearchResultNotebook>) => null | string,
  UnshareWithRoleInput?: (data: WithTypename<UnshareWithRoleInput>) => null | string,
  UnshareWithUserInput?: (data: WithTypename<UnshareWithUserInput>) => null | string,
  User?: (data: WithTypename<User>) => null | string,
  UserAccess?: (data: WithTypename<UserAccess>) => null | string,
  Workspace?: (data: WithTypename<Workspace>) => null | string,
  WorkspaceAccess?: (data: WithTypename<WorkspaceAccess>) => null | string,
  WorkspaceExecutedQuery?: (data: WithTypename<WorkspaceExecutedQuery>) => null | string,
  WorkspaceSubscription?: (data: WithTypename<WorkspaceSubscription>) => null | string,
  WorkspacesChanges?: (data: WithTypename<WorkspacesChanges>) => null | string
}

export type GraphCacheResolvers = {
  Query?: {
    featuredPad?: GraphCacheResolver<WithTypename<Query>, Record<string, never>, WithTypename<Pad> | string>,
    getAliasesByPadId?: GraphCacheResolver<WithTypename<Query>, QueryGetAliasesByPadIdArgs, Array<WithTypename<PadAlias> | string>>,
    getAnnotationsByPadId?: GraphCacheResolver<WithTypename<Query>, QueryGetAnnotationsByPadIdArgs, Array<WithTypename<Annotation> | string>>,
    getCreditsPlans?: GraphCacheResolver<WithTypename<Query>, Record<string, never>, WithTypename<CreditsPlan> | string>,
    getExternalDataSource?: GraphCacheResolver<WithTypename<Query>, QueryGetExternalDataSourceArgs, WithTypename<ExternalDataSource> | string>,
    getExternalDataSources?: GraphCacheResolver<WithTypename<Query>, QueryGetExternalDataSourcesArgs, Array<WithTypename<ExternalDataSource> | string>>,
    getExternalDataSourcesWorkspace?: GraphCacheResolver<WithTypename<Query>, QueryGetExternalDataSourcesWorkspaceArgs, Array<WithTypename<ExternalDataSource> | string>>,
    getPadById?: GraphCacheResolver<WithTypename<Query>, QueryGetPadByIdArgs, WithTypename<Pad> | string>,
    getStripeCheckoutSessionInfo?: GraphCacheResolver<WithTypename<Query>, QueryGetStripeCheckoutSessionInfoArgs, WithTypename<CheckoutSessionInfo> | string>,
    getSubscriptionsPlans?: GraphCacheResolver<WithTypename<Query>, Record<string, never>, Array<WithTypename<SubscriptionPlan> | string>>,
    getWorkspaceById?: GraphCacheResolver<WithTypename<Query>, QueryGetWorkspaceByIdArgs, WithTypename<Workspace> | string>,
    getWorkspaceSecrets?: GraphCacheResolver<WithTypename<Query>, QueryGetWorkspaceSecretsArgs, Array<WithTypename<Secret> | string>>,
    me?: GraphCacheResolver<WithTypename<Query>, Record<string, never>, WithTypename<User> | string>,
    pads?: GraphCacheResolver<WithTypename<Query>, QueryPadsArgs, WithTypename<PagedPadResult> | string>,
    padsByTag?: GraphCacheResolver<WithTypename<Query>, QueryPadsByTagArgs, WithTypename<PagedPadResult> | string>,
    padsSharedWithMe?: GraphCacheResolver<WithTypename<Query>, QueryPadsSharedWithMeArgs, WithTypename<PagedPadResult> | string>,
    publiclyHighlightedPads?: GraphCacheResolver<WithTypename<Query>, QueryPubliclyHighlightedPadsArgs, WithTypename<PagedPadResult> | string>,
    searchTemplates?: GraphCacheResolver<WithTypename<Query>, QuerySearchTemplatesArgs, WithTypename<PagedTemplateSearchResult> | string>,
    sections?: GraphCacheResolver<WithTypename<Query>, QuerySectionsArgs, Array<WithTypename<Section> | string>>,
    self?: GraphCacheResolver<WithTypename<Query>, Record<string, never>, WithTypename<User> | string>,
    tags?: GraphCacheResolver<WithTypename<Query>, QueryTagsArgs, Array<Scalars['String'] | string>>,
    version?: GraphCacheResolver<WithTypename<Query>, Record<string, never>, Scalars['String'] | string>,
    workspaces?: GraphCacheResolver<WithTypename<Query>, Record<string, never>, Array<WithTypename<Workspace> | string>>
  },
  Annotation?: {
    alias?: GraphCacheResolver<WithTypename<Annotation>, Record<string, never>, WithTypename<PadAlias> | string>,
    alias_id?: GraphCacheResolver<WithTypename<Annotation>, Record<string, never>, Scalars['String'] | string>,
    block_id?: GraphCacheResolver<WithTypename<Annotation>, Record<string, never>, Scalars['String'] | string>,
    content?: GraphCacheResolver<WithTypename<Annotation>, Record<string, never>, Scalars['String'] | string>,
    dateCreated?: GraphCacheResolver<WithTypename<Annotation>, Record<string, never>, Scalars['Float'] | string>,
    dateUpdated?: GraphCacheResolver<WithTypename<Annotation>, Record<string, never>, Scalars['Float'] | string>,
    id?: GraphCacheResolver<WithTypename<Annotation>, Record<string, never>, Scalars['ID'] | string>,
    meta?: GraphCacheResolver<WithTypename<Annotation>, Record<string, never>, Scalars['String'] | string>,
    pad_id?: GraphCacheResolver<WithTypename<Annotation>, Record<string, never>, Scalars['String'] | string>,
    scenario_id?: GraphCacheResolver<WithTypename<Annotation>, Record<string, never>, Scalars['String'] | string>,
    type?: GraphCacheResolver<WithTypename<Annotation>, Record<string, never>, Scalars['String'] | string>,
    user?: GraphCacheResolver<WithTypename<Annotation>, Record<string, never>, WithTypename<AnnotationUser> | string>,
    user_id?: GraphCacheResolver<WithTypename<Annotation>, Record<string, never>, Scalars['String'] | string>
  },
  AnnotationUser?: {
    avatar?: GraphCacheResolver<WithTypename<AnnotationUser>, Record<string, never>, Scalars['String'] | string>,
    id?: GraphCacheResolver<WithTypename<AnnotationUser>, Record<string, never>, Scalars['ID'] | string>,
    username?: GraphCacheResolver<WithTypename<AnnotationUser>, Record<string, never>, Scalars['String'] | string>
  },
  Attachment?: {
    createdAt?: GraphCacheResolver<WithTypename<Attachment>, Record<string, never>, Scalars['DateTime'] | string>,
    fileName?: GraphCacheResolver<WithTypename<Attachment>, Record<string, never>, Scalars['String'] | string>,
    fileSize?: GraphCacheResolver<WithTypename<Attachment>, Record<string, never>, Scalars['Int'] | string>,
    fileType?: GraphCacheResolver<WithTypename<Attachment>, Record<string, never>, Scalars['String'] | string>,
    id?: GraphCacheResolver<WithTypename<Attachment>, Record<string, never>, Scalars['ID'] | string>,
    padId?: GraphCacheResolver<WithTypename<Attachment>, Record<string, never>, Scalars['String'] | string>,
    resource?: GraphCacheResolver<WithTypename<Attachment>, Record<string, never>, WithTypename<AttachmentResource> | string>,
    resourceId?: GraphCacheResolver<WithTypename<Attachment>, Record<string, never>, Scalars['String'] | string>,
    resourceType?: GraphCacheResolver<WithTypename<Attachment>, Record<string, never>, AttachmentOwnership | string>,
    uploadedBy?: GraphCacheResolver<WithTypename<Attachment>, Record<string, never>, WithTypename<User> | string>,
    url?: GraphCacheResolver<WithTypename<Attachment>, Record<string, never>, Scalars['String'] | string>,
    userId?: GraphCacheResolver<WithTypename<Attachment>, Record<string, never>, Scalars['String'] | string>
  },
  CheckoutSessionInfo?: {
    clientSecret?: GraphCacheResolver<WithTypename<CheckoutSessionInfo>, Record<string, never>, Scalars['String'] | string>,
    id?: GraphCacheResolver<WithTypename<CheckoutSessionInfo>, Record<string, never>, Scalars['ID'] | string>
  },
  CreateAttachmentForm?: {
    fields?: GraphCacheResolver<WithTypename<CreateAttachmentForm>, Record<string, never>, Array<WithTypename<KeyValue> | string>>,
    handle?: GraphCacheResolver<WithTypename<CreateAttachmentForm>, Record<string, never>, Scalars['String'] | string>,
    url?: GraphCacheResolver<WithTypename<CreateAttachmentForm>, Record<string, never>, Scalars['String'] | string>
  },
  CreditPricePlan?: {
    credits?: GraphCacheResolver<WithTypename<CreditPricePlan>, Record<string, never>, Scalars['Int'] | string>,
    currency?: GraphCacheResolver<WithTypename<CreditPricePlan>, Record<string, never>, Scalars['String'] | string>,
    description?: GraphCacheResolver<WithTypename<CreditPricePlan>, Record<string, never>, Scalars['String'] | string>,
    id?: GraphCacheResolver<WithTypename<CreditPricePlan>, Record<string, never>, Scalars['ID'] | string>,
    isDefault?: GraphCacheResolver<WithTypename<CreditPricePlan>, Record<string, never>, Scalars['Boolean'] | string>,
    price?: GraphCacheResolver<WithTypename<CreditPricePlan>, Record<string, never>, Scalars['Int'] | string>,
    promotionTag?: GraphCacheResolver<WithTypename<CreditPricePlan>, Record<string, never>, Scalars['String'] | string>,
    title?: GraphCacheResolver<WithTypename<CreditPricePlan>, Record<string, never>, Scalars['String'] | string>
  },
  CreditsPlan?: {
    description?: GraphCacheResolver<WithTypename<CreditsPlan>, Record<string, never>, Scalars['String'] | string>,
    id?: GraphCacheResolver<WithTypename<CreditsPlan>, Record<string, never>, Scalars['ID'] | string>,
    plans?: GraphCacheResolver<WithTypename<CreditsPlan>, Record<string, never>, Array<WithTypename<CreditPricePlan> | string>>,
    title?: GraphCacheResolver<WithTypename<CreditsPlan>, Record<string, never>, Scalars['String'] | string>
  },
  ExternalDataSource?: {
    access?: GraphCacheResolver<WithTypename<ExternalDataSource>, Record<string, never>, WithTypename<ResourceAccess> | string>,
    authUrl?: GraphCacheResolver<WithTypename<ExternalDataSource>, Record<string, never>, Scalars['String'] | string>,
    dataSourceName?: GraphCacheResolver<WithTypename<ExternalDataSource>, Record<string, never>, Scalars['String'] | string>,
    dataUrl?: GraphCacheResolver<WithTypename<ExternalDataSource>, Record<string, never>, Scalars['String'] | string>,
    externalId?: GraphCacheResolver<WithTypename<ExternalDataSource>, Record<string, never>, Scalars['String'] | string>,
    id?: GraphCacheResolver<WithTypename<ExternalDataSource>, Record<string, never>, Scalars['ID'] | string>,
    keys?: GraphCacheResolver<WithTypename<ExternalDataSource>, Record<string, never>, Array<WithTypename<ExternalKey> | string>>,
    name?: GraphCacheResolver<WithTypename<ExternalDataSource>, Record<string, never>, Scalars['String'] | string>,
    owner?: GraphCacheResolver<WithTypename<ExternalDataSource>, Record<string, never>, ExternalDataSourceOwnership | string>,
    ownerId?: GraphCacheResolver<WithTypename<ExternalDataSource>, Record<string, never>, Scalars['String'] | string>,
    provider?: GraphCacheResolver<WithTypename<ExternalDataSource>, Record<string, never>, ExternalProvider | string>
  },
  ExternalKey?: {
    access?: GraphCacheResolver<WithTypename<ExternalKey>, Record<string, never>, Scalars['String'] | string>,
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
  NewResourceQuotaLimit?: {
    newQuotaLimit?: GraphCacheResolver<WithTypename<NewResourceQuotaLimit>, Record<string, never>, Scalars['Float'] | string>
  },
  Pad?: {
    access?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, WithTypename<ResourceAccess> | string>,
    aliases?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Array<WithTypename<PadAlias> | string>>,
    archived?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Scalars['Boolean'] | string>,
    attachments?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Array<WithTypename<Attachment> | string>>,
    banned?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Scalars['Boolean'] | string>,
    canPublicDuplicate?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Scalars['Boolean'] | string>,
    createdAt?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Scalars['DateTime'] | string>,
    document?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Scalars['String'] | string>,
    gist?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Gist | string>,
    icon?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Scalars['String'] | string>,
    id?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Scalars['ID'] | string>,
    initialState?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Scalars['String'] | string>,
    isPublic?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Scalars['Boolean'] | string>,
    isTemplate?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Scalars['Boolean'] | string>,
    myPermissionType?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, PermissionType | string>,
    name?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Scalars['String'] | string>,
    numberFormatting?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Scalars['String'] | string>,
    padConnectionParams?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, WithTypename<PadConnectionParams> | string>,
    section?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, WithTypename<Section> | string>,
    sectionId?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Scalars['ID'] | string>,
    snapshots?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Array<WithTypename<PadSnapshot> | string>>,
    status?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Scalars['String'] | string>,
    tags?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Array<Scalars['String'] | string>>,
    userConsentToFeatureOnGallery?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Scalars['Boolean'] | string>,
    workspace?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, WithTypename<Workspace> | string>,
    workspaceId?: GraphCacheResolver<WithTypename<Pad>, Record<string, never>, Scalars['ID'] | string>
  },
  PadAlias?: {
    alias?: GraphCacheResolver<WithTypename<PadAlias>, Record<string, never>, Scalars['String'] | string>,
    annotations?: GraphCacheResolver<WithTypename<PadAlias>, Record<string, never>, Array<WithTypename<Annotation> | string>>,
    events?: GraphCacheResolver<WithTypename<PadAlias>, Record<string, never>, Array<WithTypename<PadEvent> | string>>,
    id?: GraphCacheResolver<WithTypename<PadAlias>, Record<string, never>, Scalars['ID'] | string>,
    pad_id?: GraphCacheResolver<WithTypename<PadAlias>, Record<string, never>, Scalars['ID'] | string>
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
  PadEvent?: {
    alias_id?: GraphCacheResolver<WithTypename<PadEvent>, Record<string, never>, Scalars['ID'] | string>,
    created_at?: GraphCacheResolver<WithTypename<PadEvent>, Record<string, never>, Scalars['Float'] | string>,
    id?: GraphCacheResolver<WithTypename<PadEvent>, Record<string, never>, Scalars['ID'] | string>,
    meta?: GraphCacheResolver<WithTypename<PadEvent>, Record<string, never>, Scalars['String'] | string>,
    name?: GraphCacheResolver<WithTypename<PadEvent>, Record<string, never>, Scalars['String'] | string>
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
  PagedTemplateSearchResult?: {
    count?: GraphCacheResolver<WithTypename<PagedTemplateSearchResult>, Record<string, never>, Scalars['Int'] | string>,
    cursor?: GraphCacheResolver<WithTypename<PagedTemplateSearchResult>, Record<string, never>, Scalars['String'] | string>,
    hasNextPage?: GraphCacheResolver<WithTypename<PagedTemplateSearchResult>, Record<string, never>, Scalars['Boolean'] | string>,
    items?: GraphCacheResolver<WithTypename<PagedTemplateSearchResult>, Record<string, never>, Array<WithTypename<TemplateSearchResult> | string>>
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
  ResourceAccess?: {
    id?: GraphCacheResolver<WithTypename<ResourceAccess>, Record<string, never>, Scalars['ID'] | string>,
    roles?: GraphCacheResolver<WithTypename<ResourceAccess>, Record<string, never>, Array<WithTypename<RoleAccess> | string>>,
    users?: GraphCacheResolver<WithTypename<ResourceAccess>, Record<string, never>, Array<WithTypename<UserAccess> | string>>
  },
  ResourceUsage?: {
    consumption?: GraphCacheResolver<WithTypename<ResourceUsage>, Record<string, never>, Scalars['Float'] | string>,
    id?: GraphCacheResolver<WithTypename<ResourceUsage>, Record<string, never>, Scalars['ID'] | string>,
    originalAmount?: GraphCacheResolver<WithTypename<ResourceUsage>, Record<string, never>, Scalars['Float'] | string>,
    resourceType?: GraphCacheResolver<WithTypename<ResourceUsage>, Record<string, never>, ResourceTypes | string>
  },
  Role?: {
    createdAt?: GraphCacheResolver<WithTypename<Role>, Record<string, never>, Scalars['DateTime'] | string>,
    id?: GraphCacheResolver<WithTypename<Role>, Record<string, never>, Scalars['ID'] | string>,
    name?: GraphCacheResolver<WithTypename<Role>, Record<string, never>, Scalars['String'] | string>,
    users?: GraphCacheResolver<WithTypename<Role>, Record<string, never>, Array<WithTypename<User> | string>>,
    workspace?: GraphCacheResolver<WithTypename<Role>, Record<string, never>, WithTypename<Workspace> | string>,
    workspaceId?: GraphCacheResolver<WithTypename<Role>, Record<string, never>, Scalars['String'] | string>
  },
  RoleAccess?: {
    canComment?: GraphCacheResolver<WithTypename<RoleAccess>, Record<string, never>, Scalars['Boolean'] | string>,
    permission?: GraphCacheResolver<WithTypename<RoleAccess>, Record<string, never>, PermissionType | string>,
    resourceId?: GraphCacheResolver<WithTypename<RoleAccess>, Record<string, never>, Scalars['ID'] | string>,
    role?: GraphCacheResolver<WithTypename<RoleAccess>, Record<string, never>, WithTypename<Role> | string>,
    roleId?: GraphCacheResolver<WithTypename<RoleAccess>, Record<string, never>, Scalars['ID'] | string>
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
  ShareWithEmailInput?: {
    email?: GraphCacheResolver<WithTypename<ShareWithEmailInput>, Record<string, never>, Scalars['String'] | string>,
    id?: GraphCacheResolver<WithTypename<ShareWithEmailInput>, Record<string, never>, Scalars['ID'] | string>,
    permissionType?: GraphCacheResolver<WithTypename<ShareWithEmailInput>, Record<string, never>, PermissionType | string>
  },
  ShareWithRoleInput?: {
    id?: GraphCacheResolver<WithTypename<ShareWithRoleInput>, Record<string, never>, Scalars['ID'] | string>,
    permissionType?: GraphCacheResolver<WithTypename<ShareWithRoleInput>, Record<string, never>, PermissionType | string>,
    roleId?: GraphCacheResolver<WithTypename<ShareWithRoleInput>, Record<string, never>, Scalars['ID'] | string>
  },
  ShareWithSecretInput?: {
    id?: GraphCacheResolver<WithTypename<ShareWithSecretInput>, Record<string, never>, Scalars['ID'] | string>,
    permissionType?: GraphCacheResolver<WithTypename<ShareWithSecretInput>, Record<string, never>, PermissionType | string>
  },
  ShareWithUserInput?: {
    id?: GraphCacheResolver<WithTypename<ShareWithUserInput>, Record<string, never>, Scalars['ID'] | string>,
    permissionType?: GraphCacheResolver<WithTypename<ShareWithUserInput>, Record<string, never>, PermissionType | string>,
    userId?: GraphCacheResolver<WithTypename<ShareWithUserInput>, Record<string, never>, Scalars['ID'] | string>
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
  SubscriptionPlan?: {
    credits?: GraphCacheResolver<WithTypename<SubscriptionPlan>, Record<string, never>, Scalars['Int'] | string>,
    currency?: GraphCacheResolver<WithTypename<SubscriptionPlan>, Record<string, never>, Scalars['String'] | string>,
    description?: GraphCacheResolver<WithTypename<SubscriptionPlan>, Record<string, never>, Scalars['String'] | string>,
    editors?: GraphCacheResolver<WithTypename<SubscriptionPlan>, Record<string, never>, Scalars['Int'] | string>,
    id?: GraphCacheResolver<WithTypename<SubscriptionPlan>, Record<string, never>, Scalars['ID'] | string>,
    isDefault?: GraphCacheResolver<WithTypename<SubscriptionPlan>, Record<string, never>, Scalars['Boolean'] | string>,
    key?: GraphCacheResolver<WithTypename<SubscriptionPlan>, Record<string, never>, Scalars['String'] | string>,
    paymentLink?: GraphCacheResolver<WithTypename<SubscriptionPlan>, Record<string, never>, Scalars['String'] | string>,
    price?: GraphCacheResolver<WithTypename<SubscriptionPlan>, Record<string, never>, Scalars['Int'] | string>,
    queries?: GraphCacheResolver<WithTypename<SubscriptionPlan>, Record<string, never>, Scalars['Int'] | string>,
    readers?: GraphCacheResolver<WithTypename<SubscriptionPlan>, Record<string, never>, Scalars['Int'] | string>,
    seats?: GraphCacheResolver<WithTypename<SubscriptionPlan>, Record<string, never>, Scalars['Int'] | string>,
    storage?: GraphCacheResolver<WithTypename<SubscriptionPlan>, Record<string, never>, Scalars['Int'] | string>,
    title?: GraphCacheResolver<WithTypename<SubscriptionPlan>, Record<string, never>, Scalars['String'] | string>
  },
  TagChanges?: {
    added?: GraphCacheResolver<WithTypename<TagChanges>, Record<string, never>, Array<WithTypename<TagRecord> | string>>,
    removed?: GraphCacheResolver<WithTypename<TagChanges>, Record<string, never>, Array<WithTypename<TagRecord> | string>>
  },
  TagRecord?: {
    tag?: GraphCacheResolver<WithTypename<TagRecord>, Record<string, never>, Scalars['String'] | string>,
    workspaceId?: GraphCacheResolver<WithTypename<TagRecord>, Record<string, never>, Scalars['ID'] | string>
  },
  TemplateSearchResult?: {
    notebook?: GraphCacheResolver<WithTypename<TemplateSearchResult>, Record<string, never>, WithTypename<TemplateSearchResultNotebook> | string>,
    summary?: GraphCacheResolver<WithTypename<TemplateSearchResult>, Record<string, never>, Scalars['String'] | string>
  },
  TemplateSearchResultNotebook?: {
    icon?: GraphCacheResolver<WithTypename<TemplateSearchResultNotebook>, Record<string, never>, Scalars['String'] | string>,
    id?: GraphCacheResolver<WithTypename<TemplateSearchResultNotebook>, Record<string, never>, Scalars['ID'] | string>,
    name?: GraphCacheResolver<WithTypename<TemplateSearchResultNotebook>, Record<string, never>, Scalars['String'] | string>
  },
  UnshareWithRoleInput?: {
    id?: GraphCacheResolver<WithTypename<UnshareWithRoleInput>, Record<string, never>, Scalars['ID'] | string>,
    roleId?: GraphCacheResolver<WithTypename<UnshareWithRoleInput>, Record<string, never>, Scalars['ID'] | string>
  },
  UnshareWithUserInput?: {
    id?: GraphCacheResolver<WithTypename<UnshareWithUserInput>, Record<string, never>, Scalars['ID'] | string>,
    userId?: GraphCacheResolver<WithTypename<UnshareWithUserInput>, Record<string, never>, Scalars['ID'] | string>
  },
  User?: {
    createdAt?: GraphCacheResolver<WithTypename<User>, Record<string, never>, Scalars['DateTime'] | string>,
    description?: GraphCacheResolver<WithTypename<User>, Record<string, never>, Scalars['String'] | string>,
    email?: GraphCacheResolver<WithTypename<User>, Record<string, never>, Scalars['String'] | string>,
    emailValidatedAt?: GraphCacheResolver<WithTypename<User>, Record<string, never>, Scalars['DateTime'] | string>,
    id?: GraphCacheResolver<WithTypename<User>, Record<string, never>, Scalars['ID'] | string>,
    image?: GraphCacheResolver<WithTypename<User>, Record<string, never>, Scalars['String'] | string>,
    name?: GraphCacheResolver<WithTypename<User>, Record<string, never>, Scalars['String'] | string>,
    onboarded?: GraphCacheResolver<WithTypename<User>, Record<string, never>, Scalars['Boolean'] | string>,
    resourceUsages?: GraphCacheResolver<WithTypename<User>, Record<string, never>, Array<WithTypename<ResourceUsage> | string>>,
    username?: GraphCacheResolver<WithTypename<User>, Record<string, never>, Scalars['String'] | string>
  },
  UserAccess?: {
    canComment?: GraphCacheResolver<WithTypename<UserAccess>, Record<string, never>, Scalars['Boolean'] | string>,
    permission?: GraphCacheResolver<WithTypename<UserAccess>, Record<string, never>, PermissionType | string>,
    resourceId?: GraphCacheResolver<WithTypename<UserAccess>, Record<string, never>, Scalars['ID'] | string>,
    user?: GraphCacheResolver<WithTypename<UserAccess>, Record<string, never>, WithTypename<User> | string>,
    userId?: GraphCacheResolver<WithTypename<UserAccess>, Record<string, never>, Scalars['ID'] | string>
  },
  Workspace?: {
    access?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, WithTypename<WorkspaceAccess> | string>,
    attachments?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, Array<WithTypename<Attachment> | string>>,
    createdAt?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, Scalars['DateTime'] | string>,
    id?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, Scalars['ID'] | string>,
    isPremium?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, Scalars['Boolean'] | string>,
    isPublic?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, Scalars['Boolean'] | string>,
    membersCount?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, Scalars['Int'] | string>,
    myPermissionType?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, PermissionType | string>,
    name?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, Scalars['String'] | string>,
    pads?: GraphCacheResolver<WithTypename<Workspace>, WorkspacePadsArgs, WithTypename<PagedPadResult> | string>,
    plan?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, SubscriptionPlansNames | string>,
    resourceUsages?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, Array<WithTypename<ResourceUsage> | string>>,
    roles?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, Array<WithTypename<Role> | string>>,
    secrets?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, Array<WithTypename<Secret> | string>>,
    sections?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, Array<WithTypename<Section> | string>>,
    workspaceExecutedQuery?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, WithTypename<WorkspaceExecutedQuery> | string>,
    workspaceSubscription?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, WithTypename<WorkspaceSubscription> | string>
  },
  WorkspaceAccess?: {
    id?: GraphCacheResolver<WithTypename<WorkspaceAccess>, Record<string, never>, Scalars['ID'] | string>,
    roles?: GraphCacheResolver<WithTypename<WorkspaceAccess>, Record<string, never>, Array<WithTypename<RoleAccess> | string>>,
    users?: GraphCacheResolver<WithTypename<WorkspaceAccess>, Record<string, never>, Array<WithTypename<UserAccess> | string>>
  },
  WorkspaceExecutedQuery?: {
    id?: GraphCacheResolver<WithTypename<WorkspaceExecutedQuery>, Record<string, never>, Scalars['ID'] | string>,
    queryCount?: GraphCacheResolver<WithTypename<WorkspaceExecutedQuery>, Record<string, never>, Scalars['Int'] | string>,
    query_reset_date?: GraphCacheResolver<WithTypename<WorkspaceExecutedQuery>, Record<string, never>, Scalars['DateTime'] | string>,
    quotaLimit?: GraphCacheResolver<WithTypename<WorkspaceExecutedQuery>, Record<string, never>, Scalars['Int'] | string>,
    workspace?: GraphCacheResolver<WithTypename<WorkspaceExecutedQuery>, Record<string, never>, WithTypename<Workspace> | string>
  },
  WorkspaceSubscription?: {
    credits?: GraphCacheResolver<WithTypename<WorkspaceSubscription>, Record<string, never>, Scalars['Int'] | string>,
    editors?: GraphCacheResolver<WithTypename<WorkspaceSubscription>, Record<string, never>, Scalars['Int'] | string>,
    id?: GraphCacheResolver<WithTypename<WorkspaceSubscription>, Record<string, never>, Scalars['String'] | string>,
    paymentStatus?: GraphCacheResolver<WithTypename<WorkspaceSubscription>, Record<string, never>, SubscriptionPaymentStatus | string>,
    queries?: GraphCacheResolver<WithTypename<WorkspaceSubscription>, Record<string, never>, Scalars['Int'] | string>,
    readers?: GraphCacheResolver<WithTypename<WorkspaceSubscription>, Record<string, never>, Scalars['Int'] | string>,
    seats?: GraphCacheResolver<WithTypename<WorkspaceSubscription>, Record<string, never>, Scalars['Int'] | string>,
    status?: GraphCacheResolver<WithTypename<WorkspaceSubscription>, Record<string, never>, SubscriptionStatus | string>,
    storage?: GraphCacheResolver<WithTypename<WorkspaceSubscription>, Record<string, never>, Scalars['Int'] | string>,
    workspace?: GraphCacheResolver<WithTypename<WorkspaceSubscription>, Record<string, never>, WithTypename<Workspace> | string>
  },
  WorkspacesChanges?: {
    added?: GraphCacheResolver<WithTypename<WorkspacesChanges>, Record<string, never>, Array<WithTypename<Workspace> | string>>,
    removed?: GraphCacheResolver<WithTypename<WorkspacesChanges>, Record<string, never>, Array<Scalars['ID'] | string>>,
    updated?: GraphCacheResolver<WithTypename<WorkspacesChanges>, Record<string, never>, Array<WithTypename<Workspace> | string>>
  }
};

export type GraphCacheOptimisticUpdaters = {
  addAlias?: GraphCacheOptimisticMutationResolver<MutationAddAliasArgs, WithTypename<PadAlias>>,
  addAttachmentToPad?: GraphCacheOptimisticMutationResolver<MutationAddAttachmentToPadArgs, Maybe<WithTypename<Attachment>>>,
  addNotebookToSection?: GraphCacheOptimisticMutationResolver<MutationAddNotebookToSectionArgs, Maybe<Scalars['Boolean']>>,
  addSectionToWorkspace?: GraphCacheOptimisticMutationResolver<MutationAddSectionToWorkspaceArgs, Maybe<WithTypename<Section>>>,
  addTagToPad?: GraphCacheOptimisticMutationResolver<MutationAddTagToPadArgs, Maybe<Scalars['Boolean']>>,
  attachFileToPad?: GraphCacheOptimisticMutationResolver<MutationAttachFileToPadArgs, Maybe<WithTypename<Attachment>>>,
  attachFileToWorkspace?: GraphCacheOptimisticMutationResolver<MutationAttachFileToWorkspaceArgs, Maybe<WithTypename<Attachment>>>,
  claimNotebook?: GraphCacheOptimisticMutationResolver<MutationClaimNotebookArgs, Maybe<WithTypename<Pad>>>,
  createAnnotation?: GraphCacheOptimisticMutationResolver<MutationCreateAnnotationArgs, Maybe<WithTypename<Annotation>>>,
  createExternalDataSource?: GraphCacheOptimisticMutationResolver<MutationCreateExternalDataSourceArgs, Maybe<WithTypename<ExternalDataSource>>>,
  createLogs?: GraphCacheOptimisticMutationResolver<MutationCreateLogsArgs, Maybe<Scalars['Boolean']>>,
  createOrUpdateSnapshot?: GraphCacheOptimisticMutationResolver<MutationCreateOrUpdateSnapshotArgs, Scalars['Boolean']>,
  createPad?: GraphCacheOptimisticMutationResolver<MutationCreatePadArgs, WithTypename<Pad>>,
  createRole?: GraphCacheOptimisticMutationResolver<MutationCreateRoleArgs, WithTypename<Role>>,
  createSecret?: GraphCacheOptimisticMutationResolver<MutationCreateSecretArgs, WithTypename<Secret>>,
  createSnapshot?: GraphCacheOptimisticMutationResolver<MutationCreateSnapshotArgs, Scalars['Boolean']>,
  createUserViaMagicLink?: GraphCacheOptimisticMutationResolver<MutationCreateUserViaMagicLinkArgs, WithTypename<User>>,
  createWorkspace?: GraphCacheOptimisticMutationResolver<MutationCreateWorkspaceArgs, WithTypename<Workspace>>,
  deleteAnnotation?: GraphCacheOptimisticMutationResolver<MutationDeleteAnnotationArgs, Maybe<WithTypename<Annotation>>>,
  doNothing?: GraphCacheOptimisticMutationResolver<Record<string, never>, Maybe<Scalars['Boolean']>>,
  duplicatePad?: GraphCacheOptimisticMutationResolver<MutationDuplicatePadArgs, WithTypename<Pad>>,
  getCreateAttachmentForm?: GraphCacheOptimisticMutationResolver<MutationGetCreateAttachmentFormArgs, WithTypename<CreateAttachmentForm>>,
  getCreateAttachmentFormWorkspace?: GraphCacheOptimisticMutationResolver<MutationGetCreateAttachmentFormWorkspaceArgs, WithTypename<CreateAttachmentForm>>,
  importPad?: GraphCacheOptimisticMutationResolver<MutationImportPadArgs, WithTypename<Pad>>,
  incrementQueryCount?: GraphCacheOptimisticMutationResolver<MutationIncrementQueryCountArgs, WithTypename<WorkspaceExecutedQuery>>,
  incrementResourceUsage?: GraphCacheOptimisticMutationResolver<MutationIncrementResourceUsageArgs, Maybe<WithTypename<ResourceUsage>>>,
  inviteUserToRole?: GraphCacheOptimisticMutationResolver<MutationInviteUserToRoleArgs, Array<WithTypename<RoleInvitation>>>,
  movePad?: GraphCacheOptimisticMutationResolver<MutationMovePadArgs, WithTypename<Pad>>,
  recordPadEvent?: GraphCacheOptimisticMutationResolver<MutationRecordPadEventArgs, Maybe<Scalars['Boolean']>>,
  refreshExternalDataToken?: GraphCacheOptimisticMutationResolver<MutationRefreshExternalDataTokenArgs, Scalars['String']>,
  removeAlias?: GraphCacheOptimisticMutationResolver<MutationRemoveAliasArgs, Maybe<Scalars['Boolean']>>,
  removeAttachmentFromPad?: GraphCacheOptimisticMutationResolver<MutationRemoveAttachmentFromPadArgs, Maybe<Scalars['Boolean']>>,
  removeAttachmentFromWorkspace?: GraphCacheOptimisticMutationResolver<MutationRemoveAttachmentFromWorkspaceArgs, Maybe<WithTypename<AttachmentResource>>>,
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
  undeleteAttachment?: GraphCacheOptimisticMutationResolver<MutationUndeleteAttachmentArgs, Maybe<Scalars['Boolean']>>,
  unsafeDevOnlyPermissionOverride?: GraphCacheOptimisticMutationResolver<MutationUnsafeDevOnlyPermissionOverrideArgs, Scalars['Boolean']>,
  unsafeDevOnlyPlanOverride?: GraphCacheOptimisticMutationResolver<MutationUnsafeDevOnlyPlanOverrideArgs, Scalars['Boolean']>,
  unshareExternalDataSourceWithRole?: GraphCacheOptimisticMutationResolver<MutationUnshareExternalDataSourceWithRoleArgs, Maybe<Scalars['Boolean']>>,
  unshareExternalDataSourceWithUser?: GraphCacheOptimisticMutationResolver<MutationUnshareExternalDataSourceWithUserArgs, WithTypename<ExternalDataSource>>,
  unshareNotebookWithSecret?: GraphCacheOptimisticMutationResolver<MutationUnshareNotebookWithSecretArgs, Maybe<Scalars['Boolean']>>,
  unsharePadWithRole?: GraphCacheOptimisticMutationResolver<MutationUnsharePadWithRoleArgs, Maybe<Scalars['Boolean']>>,
  unsharePadWithUser?: GraphCacheOptimisticMutationResolver<MutationUnsharePadWithUserArgs, Maybe<WithTypename<Pad>>>,
  unshareWorkspaceWithUser?: GraphCacheOptimisticMutationResolver<MutationUnshareWorkspaceWithUserArgs, Maybe<WithTypename<Workspace>>>,
  updateAnnotation?: GraphCacheOptimisticMutationResolver<MutationUpdateAnnotationArgs, Maybe<WithTypename<Annotation>>>,
  updateExternalDataSource?: GraphCacheOptimisticMutationResolver<MutationUpdateExternalDataSourceArgs, Maybe<WithTypename<ExternalDataSource>>>,
  updateExtraAiAllowance?: GraphCacheOptimisticMutationResolver<MutationUpdateExtraAiAllowanceArgs, Maybe<WithTypename<NewResourceQuotaLimit>>>,
  updatePad?: GraphCacheOptimisticMutationResolver<MutationUpdatePadArgs, WithTypename<Pad>>,
  updateSecret?: GraphCacheOptimisticMutationResolver<MutationUpdateSecretArgs, WithTypename<Secret>>,
  updateSectionInWorkspace?: GraphCacheOptimisticMutationResolver<MutationUpdateSectionInWorkspaceArgs, Maybe<Scalars['Boolean']>>,
  updateSelf?: GraphCacheOptimisticMutationResolver<MutationUpdateSelfArgs, WithTypename<User>>,
  updateWorkspace?: GraphCacheOptimisticMutationResolver<MutationUpdateWorkspaceArgs, WithTypename<Workspace>>
};

export type GraphCacheUpdaters = {
  Query?: {
    featuredPad?: GraphCacheUpdateResolver<{ featuredPad: Maybe<WithTypename<Pad>> }, Record<string, never>>,
    getAliasesByPadId?: GraphCacheUpdateResolver<{ getAliasesByPadId: Maybe<Array<WithTypename<PadAlias>>> }, QueryGetAliasesByPadIdArgs>,
    getAnnotationsByPadId?: GraphCacheUpdateResolver<{ getAnnotationsByPadId: Maybe<Array<WithTypename<Annotation>>> }, QueryGetAnnotationsByPadIdArgs>,
    getCreditsPlans?: GraphCacheUpdateResolver<{ getCreditsPlans: Maybe<WithTypename<CreditsPlan>> }, Record<string, never>>,
    getExternalDataSource?: GraphCacheUpdateResolver<{ getExternalDataSource: WithTypename<ExternalDataSource> }, QueryGetExternalDataSourceArgs>,
    getExternalDataSources?: GraphCacheUpdateResolver<{ getExternalDataSources: Array<WithTypename<ExternalDataSource>> }, QueryGetExternalDataSourcesArgs>,
    getExternalDataSourcesWorkspace?: GraphCacheUpdateResolver<{ getExternalDataSourcesWorkspace: Array<WithTypename<ExternalDataSource>> }, QueryGetExternalDataSourcesWorkspaceArgs>,
    getPadById?: GraphCacheUpdateResolver<{ getPadById: Maybe<WithTypename<Pad>> }, QueryGetPadByIdArgs>,
    getStripeCheckoutSessionInfo?: GraphCacheUpdateResolver<{ getStripeCheckoutSessionInfo: Maybe<WithTypename<CheckoutSessionInfo>> }, QueryGetStripeCheckoutSessionInfoArgs>,
    getSubscriptionsPlans?: GraphCacheUpdateResolver<{ getSubscriptionsPlans: Maybe<Array<WithTypename<SubscriptionPlan>>> }, Record<string, never>>,
    getWorkspaceById?: GraphCacheUpdateResolver<{ getWorkspaceById: Maybe<WithTypename<Workspace>> }, QueryGetWorkspaceByIdArgs>,
    getWorkspaceSecrets?: GraphCacheUpdateResolver<{ getWorkspaceSecrets: Array<WithTypename<Secret>> }, QueryGetWorkspaceSecretsArgs>,
    me?: GraphCacheUpdateResolver<{ me: Maybe<WithTypename<User>> }, Record<string, never>>,
    pads?: GraphCacheUpdateResolver<{ pads: WithTypename<PagedPadResult> }, QueryPadsArgs>,
    padsByTag?: GraphCacheUpdateResolver<{ padsByTag: WithTypename<PagedPadResult> }, QueryPadsByTagArgs>,
    padsSharedWithMe?: GraphCacheUpdateResolver<{ padsSharedWithMe: WithTypename<PagedPadResult> }, QueryPadsSharedWithMeArgs>,
    publiclyHighlightedPads?: GraphCacheUpdateResolver<{ publiclyHighlightedPads: WithTypename<PagedPadResult> }, QueryPubliclyHighlightedPadsArgs>,
    searchTemplates?: GraphCacheUpdateResolver<{ searchTemplates: WithTypename<PagedTemplateSearchResult> }, QuerySearchTemplatesArgs>,
    sections?: GraphCacheUpdateResolver<{ sections: Array<WithTypename<Section>> }, QuerySectionsArgs>,
    self?: GraphCacheUpdateResolver<{ self: Maybe<WithTypename<User>> }, Record<string, never>>,
    tags?: GraphCacheUpdateResolver<{ tags: Array<Scalars['String']> }, QueryTagsArgs>,
    version?: GraphCacheUpdateResolver<{ version: Maybe<Scalars['String']> }, Record<string, never>>,
    workspaces?: GraphCacheUpdateResolver<{ workspaces: Array<WithTypename<Workspace>> }, Record<string, never>>
  },
  Mutation?: {
    addAlias?: GraphCacheUpdateResolver<{ addAlias: WithTypename<PadAlias> }, MutationAddAliasArgs>,
    addAttachmentToPad?: GraphCacheUpdateResolver<{ addAttachmentToPad: Maybe<WithTypename<Attachment>> }, MutationAddAttachmentToPadArgs>,
    addNotebookToSection?: GraphCacheUpdateResolver<{ addNotebookToSection: Maybe<Scalars['Boolean']> }, MutationAddNotebookToSectionArgs>,
    addSectionToWorkspace?: GraphCacheUpdateResolver<{ addSectionToWorkspace: Maybe<WithTypename<Section>> }, MutationAddSectionToWorkspaceArgs>,
    addTagToPad?: GraphCacheUpdateResolver<{ addTagToPad: Maybe<Scalars['Boolean']> }, MutationAddTagToPadArgs>,
    attachFileToPad?: GraphCacheUpdateResolver<{ attachFileToPad: Maybe<WithTypename<Attachment>> }, MutationAttachFileToPadArgs>,
    attachFileToWorkspace?: GraphCacheUpdateResolver<{ attachFileToWorkspace: Maybe<WithTypename<Attachment>> }, MutationAttachFileToWorkspaceArgs>,
    claimNotebook?: GraphCacheUpdateResolver<{ claimNotebook: Maybe<WithTypename<Pad>> }, MutationClaimNotebookArgs>,
    createAnnotation?: GraphCacheUpdateResolver<{ createAnnotation: Maybe<WithTypename<Annotation>> }, MutationCreateAnnotationArgs>,
    createExternalDataSource?: GraphCacheUpdateResolver<{ createExternalDataSource: Maybe<WithTypename<ExternalDataSource>> }, MutationCreateExternalDataSourceArgs>,
    createLogs?: GraphCacheUpdateResolver<{ createLogs: Maybe<Scalars['Boolean']> }, MutationCreateLogsArgs>,
    createOrUpdateSnapshot?: GraphCacheUpdateResolver<{ createOrUpdateSnapshot: Scalars['Boolean'] }, MutationCreateOrUpdateSnapshotArgs>,
    createPad?: GraphCacheUpdateResolver<{ createPad: WithTypename<Pad> }, MutationCreatePadArgs>,
    createRole?: GraphCacheUpdateResolver<{ createRole: WithTypename<Role> }, MutationCreateRoleArgs>,
    createSecret?: GraphCacheUpdateResolver<{ createSecret: WithTypename<Secret> }, MutationCreateSecretArgs>,
    createSnapshot?: GraphCacheUpdateResolver<{ createSnapshot: Scalars['Boolean'] }, MutationCreateSnapshotArgs>,
    createUserViaMagicLink?: GraphCacheUpdateResolver<{ createUserViaMagicLink: WithTypename<User> }, MutationCreateUserViaMagicLinkArgs>,
    createWorkspace?: GraphCacheUpdateResolver<{ createWorkspace: WithTypename<Workspace> }, MutationCreateWorkspaceArgs>,
    deleteAnnotation?: GraphCacheUpdateResolver<{ deleteAnnotation: Maybe<WithTypename<Annotation>> }, MutationDeleteAnnotationArgs>,
    doNothing?: GraphCacheUpdateResolver<{ doNothing: Maybe<Scalars['Boolean']> }, Record<string, never>>,
    duplicatePad?: GraphCacheUpdateResolver<{ duplicatePad: WithTypename<Pad> }, MutationDuplicatePadArgs>,
    getCreateAttachmentForm?: GraphCacheUpdateResolver<{ getCreateAttachmentForm: WithTypename<CreateAttachmentForm> }, MutationGetCreateAttachmentFormArgs>,
    getCreateAttachmentFormWorkspace?: GraphCacheUpdateResolver<{ getCreateAttachmentFormWorkspace: WithTypename<CreateAttachmentForm> }, MutationGetCreateAttachmentFormWorkspaceArgs>,
    importPad?: GraphCacheUpdateResolver<{ importPad: WithTypename<Pad> }, MutationImportPadArgs>,
    incrementQueryCount?: GraphCacheUpdateResolver<{ incrementQueryCount: WithTypename<WorkspaceExecutedQuery> }, MutationIncrementQueryCountArgs>,
    incrementResourceUsage?: GraphCacheUpdateResolver<{ incrementResourceUsage: Maybe<WithTypename<ResourceUsage>> }, MutationIncrementResourceUsageArgs>,
    inviteUserToRole?: GraphCacheUpdateResolver<{ inviteUserToRole: Array<WithTypename<RoleInvitation>> }, MutationInviteUserToRoleArgs>,
    movePad?: GraphCacheUpdateResolver<{ movePad: WithTypename<Pad> }, MutationMovePadArgs>,
    recordPadEvent?: GraphCacheUpdateResolver<{ recordPadEvent: Maybe<Scalars['Boolean']> }, MutationRecordPadEventArgs>,
    refreshExternalDataToken?: GraphCacheUpdateResolver<{ refreshExternalDataToken: Scalars['String'] }, MutationRefreshExternalDataTokenArgs>,
    removeAlias?: GraphCacheUpdateResolver<{ removeAlias: Maybe<Scalars['Boolean']> }, MutationRemoveAliasArgs>,
    removeAttachmentFromPad?: GraphCacheUpdateResolver<{ removeAttachmentFromPad: Maybe<Scalars['Boolean']> }, MutationRemoveAttachmentFromPadArgs>,
    removeAttachmentFromWorkspace?: GraphCacheUpdateResolver<{ removeAttachmentFromWorkspace: Maybe<WithTypename<AttachmentResource>> }, MutationRemoveAttachmentFromWorkspaceArgs>,
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
    undeleteAttachment?: GraphCacheUpdateResolver<{ undeleteAttachment: Maybe<Scalars['Boolean']> }, MutationUndeleteAttachmentArgs>,
    unsafeDevOnlyPermissionOverride?: GraphCacheUpdateResolver<{ unsafeDevOnlyPermissionOverride: Scalars['Boolean'] }, MutationUnsafeDevOnlyPermissionOverrideArgs>,
    unsafeDevOnlyPlanOverride?: GraphCacheUpdateResolver<{ unsafeDevOnlyPlanOverride: Scalars['Boolean'] }, MutationUnsafeDevOnlyPlanOverrideArgs>,
    unshareExternalDataSourceWithRole?: GraphCacheUpdateResolver<{ unshareExternalDataSourceWithRole: Maybe<Scalars['Boolean']> }, MutationUnshareExternalDataSourceWithRoleArgs>,
    unshareExternalDataSourceWithUser?: GraphCacheUpdateResolver<{ unshareExternalDataSourceWithUser: WithTypename<ExternalDataSource> }, MutationUnshareExternalDataSourceWithUserArgs>,
    unshareNotebookWithSecret?: GraphCacheUpdateResolver<{ unshareNotebookWithSecret: Maybe<Scalars['Boolean']> }, MutationUnshareNotebookWithSecretArgs>,
    unsharePadWithRole?: GraphCacheUpdateResolver<{ unsharePadWithRole: Maybe<Scalars['Boolean']> }, MutationUnsharePadWithRoleArgs>,
    unsharePadWithUser?: GraphCacheUpdateResolver<{ unsharePadWithUser: Maybe<WithTypename<Pad>> }, MutationUnsharePadWithUserArgs>,
    unshareWorkspaceWithUser?: GraphCacheUpdateResolver<{ unshareWorkspaceWithUser: Maybe<WithTypename<Workspace>> }, MutationUnshareWorkspaceWithUserArgs>,
    updateAnnotation?: GraphCacheUpdateResolver<{ updateAnnotation: Maybe<WithTypename<Annotation>> }, MutationUpdateAnnotationArgs>,
    updateExternalDataSource?: GraphCacheUpdateResolver<{ updateExternalDataSource: Maybe<WithTypename<ExternalDataSource>> }, MutationUpdateExternalDataSourceArgs>,
    updateExtraAiAllowance?: GraphCacheUpdateResolver<{ updateExtraAiAllowance: Maybe<WithTypename<NewResourceQuotaLimit>> }, MutationUpdateExtraAiAllowanceArgs>,
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
  Annotation?: {
    alias?: GraphCacheUpdateResolver<Maybe<WithTypename<Annotation>>, Record<string, never>>,
    alias_id?: GraphCacheUpdateResolver<Maybe<WithTypename<Annotation>>, Record<string, never>>,
    block_id?: GraphCacheUpdateResolver<Maybe<WithTypename<Annotation>>, Record<string, never>>,
    content?: GraphCacheUpdateResolver<Maybe<WithTypename<Annotation>>, Record<string, never>>,
    dateCreated?: GraphCacheUpdateResolver<Maybe<WithTypename<Annotation>>, Record<string, never>>,
    dateUpdated?: GraphCacheUpdateResolver<Maybe<WithTypename<Annotation>>, Record<string, never>>,
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<Annotation>>, Record<string, never>>,
    meta?: GraphCacheUpdateResolver<Maybe<WithTypename<Annotation>>, Record<string, never>>,
    pad_id?: GraphCacheUpdateResolver<Maybe<WithTypename<Annotation>>, Record<string, never>>,
    scenario_id?: GraphCacheUpdateResolver<Maybe<WithTypename<Annotation>>, Record<string, never>>,
    type?: GraphCacheUpdateResolver<Maybe<WithTypename<Annotation>>, Record<string, never>>,
    user?: GraphCacheUpdateResolver<Maybe<WithTypename<Annotation>>, Record<string, never>>,
    user_id?: GraphCacheUpdateResolver<Maybe<WithTypename<Annotation>>, Record<string, never>>
  },
  AnnotationUser?: {
    avatar?: GraphCacheUpdateResolver<Maybe<WithTypename<AnnotationUser>>, Record<string, never>>,
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<AnnotationUser>>, Record<string, never>>,
    username?: GraphCacheUpdateResolver<Maybe<WithTypename<AnnotationUser>>, Record<string, never>>
  },
  Attachment?: {
    createdAt?: GraphCacheUpdateResolver<Maybe<WithTypename<Attachment>>, Record<string, never>>,
    fileName?: GraphCacheUpdateResolver<Maybe<WithTypename<Attachment>>, Record<string, never>>,
    fileSize?: GraphCacheUpdateResolver<Maybe<WithTypename<Attachment>>, Record<string, never>>,
    fileType?: GraphCacheUpdateResolver<Maybe<WithTypename<Attachment>>, Record<string, never>>,
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<Attachment>>, Record<string, never>>,
    padId?: GraphCacheUpdateResolver<Maybe<WithTypename<Attachment>>, Record<string, never>>,
    resource?: GraphCacheUpdateResolver<Maybe<WithTypename<Attachment>>, Record<string, never>>,
    resourceId?: GraphCacheUpdateResolver<Maybe<WithTypename<Attachment>>, Record<string, never>>,
    resourceType?: GraphCacheUpdateResolver<Maybe<WithTypename<Attachment>>, Record<string, never>>,
    uploadedBy?: GraphCacheUpdateResolver<Maybe<WithTypename<Attachment>>, Record<string, never>>,
    url?: GraphCacheUpdateResolver<Maybe<WithTypename<Attachment>>, Record<string, never>>,
    userId?: GraphCacheUpdateResolver<Maybe<WithTypename<Attachment>>, Record<string, never>>
  },
  CheckoutSessionInfo?: {
    clientSecret?: GraphCacheUpdateResolver<Maybe<WithTypename<CheckoutSessionInfo>>, Record<string, never>>,
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<CheckoutSessionInfo>>, Record<string, never>>
  },
  CreateAttachmentForm?: {
    fields?: GraphCacheUpdateResolver<Maybe<WithTypename<CreateAttachmentForm>>, Record<string, never>>,
    handle?: GraphCacheUpdateResolver<Maybe<WithTypename<CreateAttachmentForm>>, Record<string, never>>,
    url?: GraphCacheUpdateResolver<Maybe<WithTypename<CreateAttachmentForm>>, Record<string, never>>
  },
  CreditPricePlan?: {
    credits?: GraphCacheUpdateResolver<Maybe<WithTypename<CreditPricePlan>>, Record<string, never>>,
    currency?: GraphCacheUpdateResolver<Maybe<WithTypename<CreditPricePlan>>, Record<string, never>>,
    description?: GraphCacheUpdateResolver<Maybe<WithTypename<CreditPricePlan>>, Record<string, never>>,
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<CreditPricePlan>>, Record<string, never>>,
    isDefault?: GraphCacheUpdateResolver<Maybe<WithTypename<CreditPricePlan>>, Record<string, never>>,
    price?: GraphCacheUpdateResolver<Maybe<WithTypename<CreditPricePlan>>, Record<string, never>>,
    promotionTag?: GraphCacheUpdateResolver<Maybe<WithTypename<CreditPricePlan>>, Record<string, never>>,
    title?: GraphCacheUpdateResolver<Maybe<WithTypename<CreditPricePlan>>, Record<string, never>>
  },
  CreditsPlan?: {
    description?: GraphCacheUpdateResolver<Maybe<WithTypename<CreditsPlan>>, Record<string, never>>,
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<CreditsPlan>>, Record<string, never>>,
    plans?: GraphCacheUpdateResolver<Maybe<WithTypename<CreditsPlan>>, Record<string, never>>,
    title?: GraphCacheUpdateResolver<Maybe<WithTypename<CreditsPlan>>, Record<string, never>>
  },
  ExternalDataSource?: {
    access?: GraphCacheUpdateResolver<Maybe<WithTypename<ExternalDataSource>>, Record<string, never>>,
    authUrl?: GraphCacheUpdateResolver<Maybe<WithTypename<ExternalDataSource>>, Record<string, never>>,
    dataSourceName?: GraphCacheUpdateResolver<Maybe<WithTypename<ExternalDataSource>>, Record<string, never>>,
    dataUrl?: GraphCacheUpdateResolver<Maybe<WithTypename<ExternalDataSource>>, Record<string, never>>,
    externalId?: GraphCacheUpdateResolver<Maybe<WithTypename<ExternalDataSource>>, Record<string, never>>,
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<ExternalDataSource>>, Record<string, never>>,
    keys?: GraphCacheUpdateResolver<Maybe<WithTypename<ExternalDataSource>>, Record<string, never>>,
    name?: GraphCacheUpdateResolver<Maybe<WithTypename<ExternalDataSource>>, Record<string, never>>,
    owner?: GraphCacheUpdateResolver<Maybe<WithTypename<ExternalDataSource>>, Record<string, never>>,
    ownerId?: GraphCacheUpdateResolver<Maybe<WithTypename<ExternalDataSource>>, Record<string, never>>,
    provider?: GraphCacheUpdateResolver<Maybe<WithTypename<ExternalDataSource>>, Record<string, never>>
  },
  ExternalKey?: {
    access?: GraphCacheUpdateResolver<Maybe<WithTypename<ExternalKey>>, Record<string, never>>,
    createdAt?: GraphCacheUpdateResolver<Maybe<WithTypename<ExternalKey>>, Record<string, never>>,
    expiresAt?: GraphCacheUpdateResolver<Maybe<WithTypename<ExternalKey>>, Record<string, never>>,
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<ExternalKey>>, Record<string, never>>,
    lastError?: GraphCacheUpdateResolver<Maybe<WithTypename<ExternalKey>>, Record<string, never>>,
    lastUsedAt?: GraphCacheUpdateResolver<Maybe<WithTypename<ExternalKey>>, Record<string, never>>
  },
  KeyValue?: {
    key?: GraphCacheUpdateResolver<Maybe<WithTypename<KeyValue>>, Record<string, never>>,
    value?: GraphCacheUpdateResolver<Maybe<WithTypename<KeyValue>>, Record<string, never>>
  },
  NewResourceQuotaLimit?: {
    newQuotaLimit?: GraphCacheUpdateResolver<Maybe<WithTypename<NewResourceQuotaLimit>>, Record<string, never>>
  },
  Pad?: {
    access?: GraphCacheUpdateResolver<Maybe<WithTypename<Pad>>, Record<string, never>>,
    aliases?: GraphCacheUpdateResolver<Maybe<WithTypename<Pad>>, Record<string, never>>,
    archived?: GraphCacheUpdateResolver<Maybe<WithTypename<Pad>>, Record<string, never>>,
    attachments?: GraphCacheUpdateResolver<Maybe<WithTypename<Pad>>, Record<string, never>>,
    banned?: GraphCacheUpdateResolver<Maybe<WithTypename<Pad>>, Record<string, never>>,
    canPublicDuplicate?: GraphCacheUpdateResolver<Maybe<WithTypename<Pad>>, Record<string, never>>,
    createdAt?: GraphCacheUpdateResolver<Maybe<WithTypename<Pad>>, Record<string, never>>,
    document?: GraphCacheUpdateResolver<Maybe<WithTypename<Pad>>, Record<string, never>>,
    gist?: GraphCacheUpdateResolver<Maybe<WithTypename<Pad>>, Record<string, never>>,
    icon?: GraphCacheUpdateResolver<Maybe<WithTypename<Pad>>, Record<string, never>>,
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<Pad>>, Record<string, never>>,
    initialState?: GraphCacheUpdateResolver<Maybe<WithTypename<Pad>>, Record<string, never>>,
    isPublic?: GraphCacheUpdateResolver<Maybe<WithTypename<Pad>>, Record<string, never>>,
    isTemplate?: GraphCacheUpdateResolver<Maybe<WithTypename<Pad>>, Record<string, never>>,
    myPermissionType?: GraphCacheUpdateResolver<Maybe<WithTypename<Pad>>, Record<string, never>>,
    name?: GraphCacheUpdateResolver<Maybe<WithTypename<Pad>>, Record<string, never>>,
    numberFormatting?: GraphCacheUpdateResolver<Maybe<WithTypename<Pad>>, Record<string, never>>,
    padConnectionParams?: GraphCacheUpdateResolver<Maybe<WithTypename<Pad>>, Record<string, never>>,
    section?: GraphCacheUpdateResolver<Maybe<WithTypename<Pad>>, Record<string, never>>,
    sectionId?: GraphCacheUpdateResolver<Maybe<WithTypename<Pad>>, Record<string, never>>,
    snapshots?: GraphCacheUpdateResolver<Maybe<WithTypename<Pad>>, Record<string, never>>,
    status?: GraphCacheUpdateResolver<Maybe<WithTypename<Pad>>, Record<string, never>>,
    tags?: GraphCacheUpdateResolver<Maybe<WithTypename<Pad>>, Record<string, never>>,
    userConsentToFeatureOnGallery?: GraphCacheUpdateResolver<Maybe<WithTypename<Pad>>, Record<string, never>>,
    workspace?: GraphCacheUpdateResolver<Maybe<WithTypename<Pad>>, Record<string, never>>,
    workspaceId?: GraphCacheUpdateResolver<Maybe<WithTypename<Pad>>, Record<string, never>>
  },
  PadAlias?: {
    alias?: GraphCacheUpdateResolver<Maybe<WithTypename<PadAlias>>, Record<string, never>>,
    annotations?: GraphCacheUpdateResolver<Maybe<WithTypename<PadAlias>>, Record<string, never>>,
    events?: GraphCacheUpdateResolver<Maybe<WithTypename<PadAlias>>, Record<string, never>>,
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<PadAlias>>, Record<string, never>>,
    pad_id?: GraphCacheUpdateResolver<Maybe<WithTypename<PadAlias>>, Record<string, never>>
  },
  PadChanges?: {
    added?: GraphCacheUpdateResolver<Maybe<WithTypename<PadChanges>>, Record<string, never>>,
    removed?: GraphCacheUpdateResolver<Maybe<WithTypename<PadChanges>>, Record<string, never>>,
    updated?: GraphCacheUpdateResolver<Maybe<WithTypename<PadChanges>>, Record<string, never>>
  },
  PadConnectionParams?: {
    token?: GraphCacheUpdateResolver<Maybe<WithTypename<PadConnectionParams>>, Record<string, never>>,
    url?: GraphCacheUpdateResolver<Maybe<WithTypename<PadConnectionParams>>, Record<string, never>>
  },
  PadEvent?: {
    alias_id?: GraphCacheUpdateResolver<Maybe<WithTypename<PadEvent>>, Record<string, never>>,
    created_at?: GraphCacheUpdateResolver<Maybe<WithTypename<PadEvent>>, Record<string, never>>,
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<PadEvent>>, Record<string, never>>,
    meta?: GraphCacheUpdateResolver<Maybe<WithTypename<PadEvent>>, Record<string, never>>,
    name?: GraphCacheUpdateResolver<Maybe<WithTypename<PadEvent>>, Record<string, never>>
  },
  PadSnapshot?: {
    createdAt?: GraphCacheUpdateResolver<Maybe<WithTypename<PadSnapshot>>, Record<string, never>>,
    data?: GraphCacheUpdateResolver<Maybe<WithTypename<PadSnapshot>>, Record<string, never>>,
    snapshotName?: GraphCacheUpdateResolver<Maybe<WithTypename<PadSnapshot>>, Record<string, never>>,
    updatedAt?: GraphCacheUpdateResolver<Maybe<WithTypename<PadSnapshot>>, Record<string, never>>,
    version?: GraphCacheUpdateResolver<Maybe<WithTypename<PadSnapshot>>, Record<string, never>>
  },
  PagedPadResult?: {
    count?: GraphCacheUpdateResolver<Maybe<WithTypename<PagedPadResult>>, Record<string, never>>,
    cursor?: GraphCacheUpdateResolver<Maybe<WithTypename<PagedPadResult>>, Record<string, never>>,
    hasNextPage?: GraphCacheUpdateResolver<Maybe<WithTypename<PagedPadResult>>, Record<string, never>>,
    items?: GraphCacheUpdateResolver<Maybe<WithTypename<PagedPadResult>>, Record<string, never>>
  },
  PagedResult?: {
    count?: GraphCacheUpdateResolver<Maybe<WithTypename<PagedResult>>, Record<string, never>>,
    cursor?: GraphCacheUpdateResolver<Maybe<WithTypename<PagedResult>>, Record<string, never>>,
    hasNextPage?: GraphCacheUpdateResolver<Maybe<WithTypename<PagedResult>>, Record<string, never>>,
    items?: GraphCacheUpdateResolver<Maybe<WithTypename<PagedResult>>, Record<string, never>>
  },
  PagedTemplateSearchResult?: {
    count?: GraphCacheUpdateResolver<Maybe<WithTypename<PagedTemplateSearchResult>>, Record<string, never>>,
    cursor?: GraphCacheUpdateResolver<Maybe<WithTypename<PagedTemplateSearchResult>>, Record<string, never>>,
    hasNextPage?: GraphCacheUpdateResolver<Maybe<WithTypename<PagedTemplateSearchResult>>, Record<string, never>>,
    items?: GraphCacheUpdateResolver<Maybe<WithTypename<PagedTemplateSearchResult>>, Record<string, never>>
  },
  Permission?: {
    canComment?: GraphCacheUpdateResolver<Maybe<WithTypename<Permission>>, Record<string, never>>,
    createdAt?: GraphCacheUpdateResolver<Maybe<WithTypename<Permission>>, Record<string, never>>,
    givenBy?: GraphCacheUpdateResolver<Maybe<WithTypename<Permission>>, Record<string, never>>,
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<Permission>>, Record<string, never>>,
    resource?: GraphCacheUpdateResolver<Maybe<WithTypename<Permission>>, Record<string, never>>,
    type?: GraphCacheUpdateResolver<Maybe<WithTypename<Permission>>, Record<string, never>>,
    user?: GraphCacheUpdateResolver<Maybe<WithTypename<Permission>>, Record<string, never>>
  },
  ResourceAccess?: {
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<ResourceAccess>>, Record<string, never>>,
    roles?: GraphCacheUpdateResolver<Maybe<WithTypename<ResourceAccess>>, Record<string, never>>,
    users?: GraphCacheUpdateResolver<Maybe<WithTypename<ResourceAccess>>, Record<string, never>>
  },
  ResourceUsage?: {
    consumption?: GraphCacheUpdateResolver<Maybe<WithTypename<ResourceUsage>>, Record<string, never>>,
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<ResourceUsage>>, Record<string, never>>,
    originalAmount?: GraphCacheUpdateResolver<Maybe<WithTypename<ResourceUsage>>, Record<string, never>>,
    resourceType?: GraphCacheUpdateResolver<Maybe<WithTypename<ResourceUsage>>, Record<string, never>>
  },
  Role?: {
    createdAt?: GraphCacheUpdateResolver<Maybe<WithTypename<Role>>, Record<string, never>>,
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<Role>>, Record<string, never>>,
    name?: GraphCacheUpdateResolver<Maybe<WithTypename<Role>>, Record<string, never>>,
    users?: GraphCacheUpdateResolver<Maybe<WithTypename<Role>>, Record<string, never>>,
    workspace?: GraphCacheUpdateResolver<Maybe<WithTypename<Role>>, Record<string, never>>,
    workspaceId?: GraphCacheUpdateResolver<Maybe<WithTypename<Role>>, Record<string, never>>
  },
  RoleAccess?: {
    canComment?: GraphCacheUpdateResolver<Maybe<WithTypename<RoleAccess>>, Record<string, never>>,
    permission?: GraphCacheUpdateResolver<Maybe<WithTypename<RoleAccess>>, Record<string, never>>,
    resourceId?: GraphCacheUpdateResolver<Maybe<WithTypename<RoleAccess>>, Record<string, never>>,
    role?: GraphCacheUpdateResolver<Maybe<WithTypename<RoleAccess>>, Record<string, never>>,
    roleId?: GraphCacheUpdateResolver<Maybe<WithTypename<RoleAccess>>, Record<string, never>>
  },
  RoleInvitation?: {
    expires_at?: GraphCacheUpdateResolver<Maybe<WithTypename<RoleInvitation>>, Record<string, never>>,
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<RoleInvitation>>, Record<string, never>>,
    role?: GraphCacheUpdateResolver<Maybe<WithTypename<RoleInvitation>>, Record<string, never>>,
    user?: GraphCacheUpdateResolver<Maybe<WithTypename<RoleInvitation>>, Record<string, never>>
  },
  Secret?: {
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<Secret>>, Record<string, never>>,
    name?: GraphCacheUpdateResolver<Maybe<WithTypename<Secret>>, Record<string, never>>,
    workspace?: GraphCacheUpdateResolver<Maybe<WithTypename<Secret>>, Record<string, never>>
  },
  SecretAccess?: {
    canComment?: GraphCacheUpdateResolver<Maybe<WithTypename<SecretAccess>>, Record<string, never>>,
    permission?: GraphCacheUpdateResolver<Maybe<WithTypename<SecretAccess>>, Record<string, never>>,
    secret?: GraphCacheUpdateResolver<Maybe<WithTypename<SecretAccess>>, Record<string, never>>
  },
  Section?: {
    color?: GraphCacheUpdateResolver<Maybe<WithTypename<Section>>, Record<string, never>>,
    createdAt?: GraphCacheUpdateResolver<Maybe<WithTypename<Section>>, Record<string, never>>,
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<Section>>, Record<string, never>>,
    name?: GraphCacheUpdateResolver<Maybe<WithTypename<Section>>, Record<string, never>>,
    pads?: GraphCacheUpdateResolver<Maybe<WithTypename<Section>>, Record<string, never>>,
    workspace_id?: GraphCacheUpdateResolver<Maybe<WithTypename<Section>>, Record<string, never>>
  },
  SectionChanges?: {
    added?: GraphCacheUpdateResolver<Maybe<WithTypename<SectionChanges>>, Record<string, never>>,
    removed?: GraphCacheUpdateResolver<Maybe<WithTypename<SectionChanges>>, Record<string, never>>,
    updated?: GraphCacheUpdateResolver<Maybe<WithTypename<SectionChanges>>, Record<string, never>>
  },
  ShareInvitation?: {
    email?: GraphCacheUpdateResolver<Maybe<WithTypename<ShareInvitation>>, Record<string, never>>
  },
  ShareWithEmailInput?: {
    email?: GraphCacheUpdateResolver<Maybe<WithTypename<ShareWithEmailInput>>, Record<string, never>>,
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<ShareWithEmailInput>>, Record<string, never>>,
    permissionType?: GraphCacheUpdateResolver<Maybe<WithTypename<ShareWithEmailInput>>, Record<string, never>>
  },
  ShareWithRoleInput?: {
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<ShareWithRoleInput>>, Record<string, never>>,
    permissionType?: GraphCacheUpdateResolver<Maybe<WithTypename<ShareWithRoleInput>>, Record<string, never>>,
    roleId?: GraphCacheUpdateResolver<Maybe<WithTypename<ShareWithRoleInput>>, Record<string, never>>
  },
  ShareWithSecretInput?: {
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<ShareWithSecretInput>>, Record<string, never>>,
    permissionType?: GraphCacheUpdateResolver<Maybe<WithTypename<ShareWithSecretInput>>, Record<string, never>>
  },
  ShareWithUserInput?: {
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<ShareWithUserInput>>, Record<string, never>>,
    permissionType?: GraphCacheUpdateResolver<Maybe<WithTypename<ShareWithUserInput>>, Record<string, never>>,
    userId?: GraphCacheUpdateResolver<Maybe<WithTypename<ShareWithUserInput>>, Record<string, never>>
  },
  SharedResource?: {
    canComment?: GraphCacheUpdateResolver<Maybe<WithTypename<SharedResource>>, Record<string, never>>,
    permission?: GraphCacheUpdateResolver<Maybe<WithTypename<SharedResource>>, Record<string, never>>,
    resource?: GraphCacheUpdateResolver<Maybe<WithTypename<SharedResource>>, Record<string, never>>
  },
  SharedWith?: {
    pendingInvitations?: GraphCacheUpdateResolver<Maybe<WithTypename<SharedWith>>, Record<string, never>>,
    roles?: GraphCacheUpdateResolver<Maybe<WithTypename<SharedWith>>, Record<string, never>>,
    users?: GraphCacheUpdateResolver<Maybe<WithTypename<SharedWith>>, Record<string, never>>
  },
  SharedWithRole?: {
    canComment?: GraphCacheUpdateResolver<Maybe<WithTypename<SharedWithRole>>, Record<string, never>>,
    permissionType?: GraphCacheUpdateResolver<Maybe<WithTypename<SharedWithRole>>, Record<string, never>>,
    role?: GraphCacheUpdateResolver<Maybe<WithTypename<SharedWithRole>>, Record<string, never>>
  },
  SharedWithUser?: {
    canComment?: GraphCacheUpdateResolver<Maybe<WithTypename<SharedWithUser>>, Record<string, never>>,
    permissionType?: GraphCacheUpdateResolver<Maybe<WithTypename<SharedWithUser>>, Record<string, never>>,
    user?: GraphCacheUpdateResolver<Maybe<WithTypename<SharedWithUser>>, Record<string, never>>
  },
  SubscriptionPlan?: {
    credits?: GraphCacheUpdateResolver<Maybe<WithTypename<SubscriptionPlan>>, Record<string, never>>,
    currency?: GraphCacheUpdateResolver<Maybe<WithTypename<SubscriptionPlan>>, Record<string, never>>,
    description?: GraphCacheUpdateResolver<Maybe<WithTypename<SubscriptionPlan>>, Record<string, never>>,
    editors?: GraphCacheUpdateResolver<Maybe<WithTypename<SubscriptionPlan>>, Record<string, never>>,
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<SubscriptionPlan>>, Record<string, never>>,
    isDefault?: GraphCacheUpdateResolver<Maybe<WithTypename<SubscriptionPlan>>, Record<string, never>>,
    key?: GraphCacheUpdateResolver<Maybe<WithTypename<SubscriptionPlan>>, Record<string, never>>,
    paymentLink?: GraphCacheUpdateResolver<Maybe<WithTypename<SubscriptionPlan>>, Record<string, never>>,
    price?: GraphCacheUpdateResolver<Maybe<WithTypename<SubscriptionPlan>>, Record<string, never>>,
    queries?: GraphCacheUpdateResolver<Maybe<WithTypename<SubscriptionPlan>>, Record<string, never>>,
    readers?: GraphCacheUpdateResolver<Maybe<WithTypename<SubscriptionPlan>>, Record<string, never>>,
    seats?: GraphCacheUpdateResolver<Maybe<WithTypename<SubscriptionPlan>>, Record<string, never>>,
    storage?: GraphCacheUpdateResolver<Maybe<WithTypename<SubscriptionPlan>>, Record<string, never>>,
    title?: GraphCacheUpdateResolver<Maybe<WithTypename<SubscriptionPlan>>, Record<string, never>>
  },
  TagChanges?: {
    added?: GraphCacheUpdateResolver<Maybe<WithTypename<TagChanges>>, Record<string, never>>,
    removed?: GraphCacheUpdateResolver<Maybe<WithTypename<TagChanges>>, Record<string, never>>
  },
  TagRecord?: {
    tag?: GraphCacheUpdateResolver<Maybe<WithTypename<TagRecord>>, Record<string, never>>,
    workspaceId?: GraphCacheUpdateResolver<Maybe<WithTypename<TagRecord>>, Record<string, never>>
  },
  TemplateSearchResult?: {
    notebook?: GraphCacheUpdateResolver<Maybe<WithTypename<TemplateSearchResult>>, Record<string, never>>,
    summary?: GraphCacheUpdateResolver<Maybe<WithTypename<TemplateSearchResult>>, Record<string, never>>
  },
  TemplateSearchResultNotebook?: {
    icon?: GraphCacheUpdateResolver<Maybe<WithTypename<TemplateSearchResultNotebook>>, Record<string, never>>,
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<TemplateSearchResultNotebook>>, Record<string, never>>,
    name?: GraphCacheUpdateResolver<Maybe<WithTypename<TemplateSearchResultNotebook>>, Record<string, never>>
  },
  UnshareWithRoleInput?: {
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<UnshareWithRoleInput>>, Record<string, never>>,
    roleId?: GraphCacheUpdateResolver<Maybe<WithTypename<UnshareWithRoleInput>>, Record<string, never>>
  },
  UnshareWithUserInput?: {
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<UnshareWithUserInput>>, Record<string, never>>,
    userId?: GraphCacheUpdateResolver<Maybe<WithTypename<UnshareWithUserInput>>, Record<string, never>>
  },
  User?: {
    createdAt?: GraphCacheUpdateResolver<Maybe<WithTypename<User>>, Record<string, never>>,
    description?: GraphCacheUpdateResolver<Maybe<WithTypename<User>>, Record<string, never>>,
    email?: GraphCacheUpdateResolver<Maybe<WithTypename<User>>, Record<string, never>>,
    emailValidatedAt?: GraphCacheUpdateResolver<Maybe<WithTypename<User>>, Record<string, never>>,
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<User>>, Record<string, never>>,
    image?: GraphCacheUpdateResolver<Maybe<WithTypename<User>>, Record<string, never>>,
    name?: GraphCacheUpdateResolver<Maybe<WithTypename<User>>, Record<string, never>>,
    onboarded?: GraphCacheUpdateResolver<Maybe<WithTypename<User>>, Record<string, never>>,
    resourceUsages?: GraphCacheUpdateResolver<Maybe<WithTypename<User>>, Record<string, never>>,
    username?: GraphCacheUpdateResolver<Maybe<WithTypename<User>>, Record<string, never>>
  },
  UserAccess?: {
    canComment?: GraphCacheUpdateResolver<Maybe<WithTypename<UserAccess>>, Record<string, never>>,
    permission?: GraphCacheUpdateResolver<Maybe<WithTypename<UserAccess>>, Record<string, never>>,
    resourceId?: GraphCacheUpdateResolver<Maybe<WithTypename<UserAccess>>, Record<string, never>>,
    user?: GraphCacheUpdateResolver<Maybe<WithTypename<UserAccess>>, Record<string, never>>,
    userId?: GraphCacheUpdateResolver<Maybe<WithTypename<UserAccess>>, Record<string, never>>
  },
  Workspace?: {
    access?: GraphCacheUpdateResolver<Maybe<WithTypename<Workspace>>, Record<string, never>>,
    attachments?: GraphCacheUpdateResolver<Maybe<WithTypename<Workspace>>, Record<string, never>>,
    createdAt?: GraphCacheUpdateResolver<Maybe<WithTypename<Workspace>>, Record<string, never>>,
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<Workspace>>, Record<string, never>>,
    isPremium?: GraphCacheUpdateResolver<Maybe<WithTypename<Workspace>>, Record<string, never>>,
    isPublic?: GraphCacheUpdateResolver<Maybe<WithTypename<Workspace>>, Record<string, never>>,
    membersCount?: GraphCacheUpdateResolver<Maybe<WithTypename<Workspace>>, Record<string, never>>,
    myPermissionType?: GraphCacheUpdateResolver<Maybe<WithTypename<Workspace>>, Record<string, never>>,
    name?: GraphCacheUpdateResolver<Maybe<WithTypename<Workspace>>, Record<string, never>>,
    pads?: GraphCacheUpdateResolver<Maybe<WithTypename<Workspace>>, WorkspacePadsArgs>,
    plan?: GraphCacheUpdateResolver<Maybe<WithTypename<Workspace>>, Record<string, never>>,
    resourceUsages?: GraphCacheUpdateResolver<Maybe<WithTypename<Workspace>>, Record<string, never>>,
    roles?: GraphCacheUpdateResolver<Maybe<WithTypename<Workspace>>, Record<string, never>>,
    secrets?: GraphCacheUpdateResolver<Maybe<WithTypename<Workspace>>, Record<string, never>>,
    sections?: GraphCacheUpdateResolver<Maybe<WithTypename<Workspace>>, Record<string, never>>,
    workspaceExecutedQuery?: GraphCacheUpdateResolver<Maybe<WithTypename<Workspace>>, Record<string, never>>,
    workspaceSubscription?: GraphCacheUpdateResolver<Maybe<WithTypename<Workspace>>, Record<string, never>>
  },
  WorkspaceAccess?: {
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<WorkspaceAccess>>, Record<string, never>>,
    roles?: GraphCacheUpdateResolver<Maybe<WithTypename<WorkspaceAccess>>, Record<string, never>>,
    users?: GraphCacheUpdateResolver<Maybe<WithTypename<WorkspaceAccess>>, Record<string, never>>
  },
  WorkspaceExecutedQuery?: {
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<WorkspaceExecutedQuery>>, Record<string, never>>,
    queryCount?: GraphCacheUpdateResolver<Maybe<WithTypename<WorkspaceExecutedQuery>>, Record<string, never>>,
    query_reset_date?: GraphCacheUpdateResolver<Maybe<WithTypename<WorkspaceExecutedQuery>>, Record<string, never>>,
    quotaLimit?: GraphCacheUpdateResolver<Maybe<WithTypename<WorkspaceExecutedQuery>>, Record<string, never>>,
    workspace?: GraphCacheUpdateResolver<Maybe<WithTypename<WorkspaceExecutedQuery>>, Record<string, never>>
  },
  WorkspaceSubscription?: {
    credits?: GraphCacheUpdateResolver<Maybe<WithTypename<WorkspaceSubscription>>, Record<string, never>>,
    editors?: GraphCacheUpdateResolver<Maybe<WithTypename<WorkspaceSubscription>>, Record<string, never>>,
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<WorkspaceSubscription>>, Record<string, never>>,
    paymentStatus?: GraphCacheUpdateResolver<Maybe<WithTypename<WorkspaceSubscription>>, Record<string, never>>,
    queries?: GraphCacheUpdateResolver<Maybe<WithTypename<WorkspaceSubscription>>, Record<string, never>>,
    readers?: GraphCacheUpdateResolver<Maybe<WithTypename<WorkspaceSubscription>>, Record<string, never>>,
    seats?: GraphCacheUpdateResolver<Maybe<WithTypename<WorkspaceSubscription>>, Record<string, never>>,
    status?: GraphCacheUpdateResolver<Maybe<WithTypename<WorkspaceSubscription>>, Record<string, never>>,
    storage?: GraphCacheUpdateResolver<Maybe<WithTypename<WorkspaceSubscription>>, Record<string, never>>,
    workspace?: GraphCacheUpdateResolver<Maybe<WithTypename<WorkspaceSubscription>>, Record<string, never>>
  },
  WorkspacesChanges?: {
    added?: GraphCacheUpdateResolver<Maybe<WithTypename<WorkspacesChanges>>, Record<string, never>>,
    removed?: GraphCacheUpdateResolver<Maybe<WithTypename<WorkspacesChanges>>, Record<string, never>>,
    updated?: GraphCacheUpdateResolver<Maybe<WithTypename<WorkspacesChanges>>, Record<string, never>>
  },
};

export type GraphCacheConfig = Parameters<typeof cacheExchange>[0] & {
  updates?: GraphCacheUpdaters,
  keys?: GraphCacheKeysConfig,
  optimistic?: GraphCacheOptimisticUpdaters,
  resolvers?: GraphCacheResolvers,
};