import { Resolver as GraphCacheResolver, UpdateResolver as GraphCacheUpdateResolver, OptimisticMutationResolver as GraphCacheOptimisticMutationResolver, StorageAdapter as GraphCacheStorageAdapter } from '@urql/exchange-graphcache';
import { IntrospectionData } from '@urql/exchange-graphcache/dist/types/ast';
import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
};

export type Attachment = {
  __typename?: 'Attachment';
  createdAt?: Maybe<Scalars['DateTime']>;
  fileName: Scalars['String'];
  fileSize: Scalars['Int'];
  fileType: Scalars['String'];
  id: Scalars['ID'];
  pad?: Maybe<Pad>;
  uploadedBy?: Maybe<User>;
  url: Scalars['String'];
};

export type CreateAttachmentForm = {
  __typename?: 'CreateAttachmentForm';
  fields: Array<KeyValue>;
  handle: Scalars['String'];
  url: Scalars['String'];
};

export type ExternalDataSource = {
  __typename?: 'ExternalDataSource';
  access: ExternalDataSourceAccess;
  authUrl: Scalars['String'];
  dataUrl: Scalars['String'];
  externalId: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
  padId: Scalars['ID'];
  provider: ExternalProvider;
};

export type ExternalDataSourceAccess = {
  __typename?: 'ExternalDataSourceAccess';
  roles: Array<RoleAccess>;
  users: Array<UserAccess>;
};

export type ExternalDataSourceCreateInput = {
  externalId: Scalars['String'];
  name: Scalars['String'];
  padId: Scalars['ID'];
  provider: ExternalProvider;
};

export type ExternalDataSourceUpdateInput = {
  name?: InputMaybe<Scalars['String']>;
};

export type ExternalKey = {
  __typename?: 'ExternalKey';
  createdAt: Scalars['DateTime'];
  expiresAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  lastError?: Maybe<Scalars['String']>;
  lastUsedAt?: Maybe<Scalars['DateTime']>;
};

export enum ExternalProvider {
  Googlesheets = 'googlesheets',
  Testdatasource = 'testdatasource'
}

export type GoalFulfilmentInput = {
  goalName: Scalars['String'];
};

export type KeyValue = {
  __typename?: 'KeyValue';
  key: Scalars['String'];
  value: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addNotebookToSection?: Maybe<Scalars['Boolean']>;
  addSectionToWorkspace?: Maybe<Section>;
  addTagToPad?: Maybe<Scalars['Boolean']>;
  attachFileToPad?: Maybe<Attachment>;
  createExternalDataSource?: Maybe<ExternalDataSource>;
  createOrUpdateSnapshot: Pad;
  createPad: Pad;
  createRole: Role;
  createUserViaMagicLink: User;
  createWorkspace: Workspace;
  doNothing?: Maybe<Scalars['Boolean']>;
  duplicatePad: Pad;
  fulfilGoal: Scalars['Boolean'];
  importPad: Pad;
  inviteUserToRole: Array<RoleInvitation>;
  movePad: Pad;
  pretendUser?: Maybe<Scalars['Boolean']>;
  removeAttachmentFromPad?: Maybe<Scalars['Boolean']>;
  removeExternalDataSource?: Maybe<Scalars['Boolean']>;
  removePad?: Maybe<Scalars['Boolean']>;
  removeRole?: Maybe<Scalars['Boolean']>;
  removeSectionFromWorkspace?: Maybe<Scalars['Boolean']>;
  removeSelfFromRole?: Maybe<Scalars['Boolean']>;
  removeTagFromPad?: Maybe<Scalars['Boolean']>;
  removeUserFromRole?: Maybe<Scalars['Boolean']>;
  removeWorkspace?: Maybe<Scalars['Boolean']>;
  resendRegistrationMagicLinkEmail?: Maybe<Scalars['Boolean']>;
  setPadPublic: Pad;
  setUsername: Scalars['Boolean'];
  shareExternalDataSourceWithEmail?: Maybe<ExternalDataSource>;
  shareExternalDataSourceWithRole?: Maybe<Scalars['Boolean']>;
  shareExternalDataSourceWithUser?: Maybe<Scalars['Boolean']>;
  sharePadWithEmail: Pad;
  sharePadWithRole?: Maybe<Scalars['Boolean']>;
  sharePadWithSecret: Scalars['String'];
  sharePadWithUser?: Maybe<Scalars['Boolean']>;
  unshareExternalDataSourceWithRole?: Maybe<Scalars['Boolean']>;
  unshareExternalDataSourceWithUser?: Maybe<Scalars['Boolean']>;
  unshareNotebookWithSecret?: Maybe<Scalars['Boolean']>;
  unsharePadWithRole?: Maybe<Scalars['Boolean']>;
  unsharePadWithUser?: Maybe<Scalars['Boolean']>;
  updateExternalDataSource?: Maybe<ExternalDataSource>;
  updatePad: Pad;
  updateSectionInWorkspace?: Maybe<Scalars['Boolean']>;
  updateSelf: User;
  updateWorkspace: Workspace;
};


export type MutationAddNotebookToSectionArgs = {
  notebookId: Scalars['ID'];
  sectionId: Scalars['ID'];
};


export type MutationAddSectionToWorkspaceArgs = {
  section: SectionInput;
  workspaceId: Scalars['ID'];
};


export type MutationAddTagToPadArgs = {
  padId: Scalars['ID'];
  tag: Scalars['String'];
};


export type MutationAttachFileToPadArgs = {
  handle: Scalars['ID'];
};


export type MutationCreateExternalDataSourceArgs = {
  dataSource: ExternalDataSourceCreateInput;
};


export type MutationCreateOrUpdateSnapshotArgs = {
  notebookId: Scalars['ID'];
  snapshotName: Scalars['String'];
};


export type MutationCreatePadArgs = {
  pad: PadInput;
  sectionId?: InputMaybe<Scalars['ID']>;
  workspaceId: Scalars['ID'];
};


export type MutationCreateRoleArgs = {
  role?: InputMaybe<RoleInput>;
};


export type MutationCreateUserViaMagicLinkArgs = {
  email: Scalars['String'];
};


export type MutationCreateWorkspaceArgs = {
  workspace: WorkspaceInput;
};


export type MutationDuplicatePadArgs = {
  document?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  targetWorkspace: Scalars['ID'];
};


export type MutationFulfilGoalArgs = {
  props: GoalFulfilmentInput;
};


export type MutationImportPadArgs = {
  source: Scalars['String'];
  workspaceId: Scalars['ID'];
};


export type MutationInviteUserToRoleArgs = {
  permission: PermissionType;
  roleId: Scalars['ID'];
  userId: Scalars['ID'];
};


export type MutationMovePadArgs = {
  id: Scalars['ID'];
  workspaceId: Scalars['ID'];
};


export type MutationPretendUserArgs = {
  userId: Scalars['ID'];
};


export type MutationRemoveAttachmentFromPadArgs = {
  attachmentId: Scalars['ID'];
};


export type MutationRemoveExternalDataSourceArgs = {
  id: Scalars['ID'];
};


export type MutationRemovePadArgs = {
  id: Scalars['ID'];
};


export type MutationRemoveRoleArgs = {
  roleId: Scalars['ID'];
};


export type MutationRemoveSectionFromWorkspaceArgs = {
  sectionId: Scalars['ID'];
  workspaceId: Scalars['ID'];
};


export type MutationRemoveSelfFromRoleArgs = {
  roleId: Scalars['ID'];
};


export type MutationRemoveTagFromPadArgs = {
  padId: Scalars['ID'];
  tag: Scalars['String'];
};


export type MutationRemoveUserFromRoleArgs = {
  roleId: Scalars['ID'];
  userId: Scalars['ID'];
};


export type MutationRemoveWorkspaceArgs = {
  id: Scalars['ID'];
};


export type MutationResendRegistrationMagicLinkEmailArgs = {
  email: Scalars['String'];
};


export type MutationSetPadPublicArgs = {
  id: Scalars['ID'];
  isPublic: Scalars['Boolean'];
};


export type MutationSetUsernameArgs = {
  props: UsernameInput;
};


export type MutationShareExternalDataSourceWithEmailArgs = {
  email?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  permissionType: PermissionType;
};


export type MutationShareExternalDataSourceWithRoleArgs = {
  id: Scalars['ID'];
  permissionType: PermissionType;
  roleId: Scalars['ID'];
};


export type MutationShareExternalDataSourceWithUserArgs = {
  id: Scalars['ID'];
  permissionType: PermissionType;
  userId: Scalars['ID'];
};


export type MutationSharePadWithEmailArgs = {
  canComment: Scalars['Boolean'];
  email: Scalars['String'];
  id: Scalars['ID'];
  permissionType: PermissionType;
};


export type MutationSharePadWithRoleArgs = {
  canComment: Scalars['Boolean'];
  id: Scalars['ID'];
  permissionType: PermissionType;
  roleId: Scalars['ID'];
};


export type MutationSharePadWithSecretArgs = {
  canComment: Scalars['Boolean'];
  id: Scalars['ID'];
  permissionType: PermissionType;
};


export type MutationSharePadWithUserArgs = {
  canComment: Scalars['Boolean'];
  id: Scalars['ID'];
  permissionType: PermissionType;
  userId: Scalars['ID'];
};


export type MutationUnshareExternalDataSourceWithRoleArgs = {
  id: Scalars['ID'];
  roleId: Scalars['ID'];
};


export type MutationUnshareExternalDataSourceWithUserArgs = {
  id: Scalars['ID'];
  userId: Scalars['ID'];
};


export type MutationUnshareNotebookWithSecretArgs = {
  id: Scalars['ID'];
  secret: Scalars['String'];
};


export type MutationUnsharePadWithRoleArgs = {
  id: Scalars['ID'];
  roleId: Scalars['ID'];
};


export type MutationUnsharePadWithUserArgs = {
  id: Scalars['ID'];
  userId: Scalars['ID'];
};


export type MutationUpdateExternalDataSourceArgs = {
  dataSource: ExternalDataSourceUpdateInput;
  id: Scalars['ID'];
};


export type MutationUpdatePadArgs = {
  id: Scalars['ID'];
  pad: PadInput;
};


export type MutationUpdateSectionInWorkspaceArgs = {
  section: SectionInput;
  sectionId: Scalars['ID'];
  workspaceId: Scalars['ID'];
};


export type MutationUpdateSelfArgs = {
  props: UserInput;
};


export type MutationUpdateWorkspaceArgs = {
  id: Scalars['ID'];
  workspace: WorkspaceInput;
};

export type Pad = {
  __typename?: 'Pad';
  access: PadAccess;
  archived?: Maybe<Scalars['Boolean']>;
  attachments: Array<Attachment>;
  createdAt?: Maybe<Scalars['DateTime']>;
  icon?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  initialState?: Maybe<Scalars['String']>;
  isPublic?: Maybe<Scalars['Boolean']>;
  myPermissionType?: Maybe<PermissionType>;
  name: Scalars['String'];
  padConnectionParams: PadConnectionParams;
  section?: Maybe<Section>;
  snapshots: Array<PadSnapshot>;
  status?: Maybe<Scalars['String']>;
  tags: Array<Scalars['String']>;
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
  removed: Array<Scalars['ID']>;
  updated: Array<Pad>;
};

export type PadConnectionParams = {
  __typename?: 'PadConnectionParams';
  token: Scalars['String'];
  url: Scalars['String'];
};

export type PadInput = {
  archived?: InputMaybe<Scalars['Boolean']>;
  icon?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  section_id?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<Scalars['String']>;
  tags?: InputMaybe<Array<Scalars['String']>>;
};

export type PadSnapshot = {
  __typename?: 'PadSnapshot';
  createdAt?: Maybe<Scalars['DateTime']>;
  data?: Maybe<Scalars['String']>;
  snapshotName: Scalars['String'];
  updatedAt?: Maybe<Scalars['DateTime']>;
  version?: Maybe<Scalars['String']>;
};

export type PageInput = {
  cursor?: InputMaybe<Scalars['String']>;
  maxItems: Scalars['Int'];
};

export type Pageable = ExternalDataSource | SharedResource;

export type PagedPadResult = {
  __typename?: 'PagedPadResult';
  count: Scalars['Int'];
  cursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
  items: Array<Pad>;
};

export type PagedResult = {
  __typename?: 'PagedResult';
  count: Scalars['Int'];
  cursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
  items: Array<Pageable>;
};

export type Permission = {
  __typename?: 'Permission';
  canComment: Scalars['Boolean'];
  createdAt?: Maybe<Scalars['DateTime']>;
  givenBy: User;
  id: Scalars['ID'];
  resource: Scalars['String'];
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
  getCreateAttachmentForm: CreateAttachmentForm;
  getExternalDataSource: ExternalDataSource;
  getExternalDataSources: PagedResult;
  getPadById?: Maybe<Pad>;
  getWorkspaceById?: Maybe<Workspace>;
  me?: Maybe<User>;
  pads: PagedPadResult;
  padsByTag: PagedPadResult;
  sections: Array<Section>;
  self?: Maybe<User>;
  selfFulfilledGoals: Array<Scalars['String']>;
  tags: Array<Scalars['String']>;
  version?: Maybe<Scalars['String']>;
  workspaces: Array<Workspace>;
};


export type QueryGetCreateAttachmentFormArgs = {
  fileName: Scalars['String'];
  fileType: Scalars['String'];
  padId: Scalars['ID'];
};


export type QueryGetExternalDataSourceArgs = {
  id: Scalars['ID'];
};


export type QueryGetExternalDataSourcesArgs = {
  page: PageInput;
};


export type QueryGetPadByIdArgs = {
  id: Scalars['ID'];
  snapshotName?: InputMaybe<Scalars['String']>;
};


export type QueryGetWorkspaceByIdArgs = {
  id: Scalars['ID'];
};


export type QueryPadsArgs = {
  page: PageInput;
  workspaceId: Scalars['ID'];
};


export type QueryPadsByTagArgs = {
  page: PageInput;
  tag: Scalars['String'];
  workspaceId: Scalars['ID'];
};


export type QuerySectionsArgs = {
  workspaceId: Scalars['ID'];
};


export type QueryTagsArgs = {
  workspaceId: Scalars['ID'];
};

export type Role = {
  __typename?: 'Role';
  createdAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  users: Array<User>;
  workspace: Workspace;
};

export type RoleAccess = {
  __typename?: 'RoleAccess';
  canComment: Scalars['Boolean'];
  permission: PermissionType;
  role: Role;
};

export type RoleInput = {
  name: Scalars['String'];
  workspaceId: Scalars['ID'];
};

export type RoleInvitation = {
  __typename?: 'RoleInvitation';
  expires_at?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  role: Role;
  user: User;
};

export type SecretAccess = {
  __typename?: 'SecretAccess';
  canComment: Scalars['Boolean'];
  permission: PermissionType;
  secret: Scalars['String'];
};

export type Section = {
  __typename?: 'Section';
  color: Scalars['String'];
  createdAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  pads: Array<Pad>;
  workspace_id: Scalars['ID'];
};

export type SectionChanges = {
  __typename?: 'SectionChanges';
  added: Array<Section>;
  removed: Array<Scalars['ID']>;
  updated: Array<Section>;
};

export type SectionInput = {
  color?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
};

export type ShareInvitation = {
  __typename?: 'ShareInvitation';
  email?: Maybe<Scalars['String']>;
};

export type SharedResource = {
  __typename?: 'SharedResource';
  canComment?: Maybe<Scalars['Boolean']>;
  permission: PermissionType;
  resource: Scalars['String'];
};

export type SharedWith = {
  __typename?: 'SharedWith';
  pendingInvitations: Array<ShareInvitation>;
  roles: Array<SharedWithRole>;
  users: Array<SharedWithUser>;
};

export type SharedWithRole = {
  __typename?: 'SharedWithRole';
  canComment: Scalars['Boolean'];
  permissionType: PermissionType;
  role: Role;
};

export type SharedWithUser = {
  __typename?: 'SharedWithUser';
  canComment: Scalars['Boolean'];
  permissionType: PermissionType;
  user: User;
};

export type Subscription = {
  __typename?: 'Subscription';
  hello?: Maybe<Scalars['String']>;
  padsChanged: PadChanges;
  sectionsChanged: SectionChanges;
  subscribeToNothing?: Maybe<Scalars['Boolean']>;
  tagsChanged: TagChanges;
  workspacesChanged: WorkspacesChanges;
};


export type SubscriptionPadsChangedArgs = {
  workspaceId: Scalars['ID'];
};


export type SubscriptionSectionsChangedArgs = {
  workspaceId: Scalars['ID'];
};


export type SubscriptionTagsChangedArgs = {
  workspaceId: Scalars['ID'];
};

export type TagChanges = {
  __typename?: 'TagChanges';
  added: Array<TagRecord>;
  removed: Array<TagRecord>;
};

export type TagRecord = {
  __typename?: 'TagRecord';
  tag: Scalars['String'];
  workspaceId: Scalars['ID'];
};

export type User = {
  __typename?: 'User';
  createdAt?: Maybe<Scalars['DateTime']>;
  description?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  hideChecklist?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  image?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  onboarded?: Maybe<Scalars['Boolean']>;
  username?: Maybe<Scalars['String']>;
};

export type UserAccess = {
  __typename?: 'UserAccess';
  canComment: Scalars['Boolean'];
  permission: PermissionType;
  user: User;
};

export type UserInput = {
  description?: InputMaybe<Scalars['String']>;
  hideChecklist?: InputMaybe<Scalars['Boolean']>;
  name?: InputMaybe<Scalars['String']>;
  onboarded?: InputMaybe<Scalars['Boolean']>;
};

export type UsernameInput = {
  username: Scalars['String'];
};

export type Workspace = {
  __typename?: 'Workspace';
  createdAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  isPublic?: Maybe<Scalars['Boolean']>;
  name: Scalars['String'];
  pads: PagedPadResult;
  roles: Array<Role>;
  sections: Array<Section>;
};


export type WorkspacePadsArgs = {
  page: PageInput;
};

export type WorkspaceInput = {
  name: Scalars['String'];
};

export type WorkspacesChanges = {
  __typename?: 'WorkspacesChanges';
  added: Array<Workspace>;
  removed: Array<Scalars['ID']>;
  updated: Array<Workspace>;
};

export type CreateNotebookMutationVariables = Exact<{
  workspaceId: Scalars['ID'];
  name: Scalars['String'];
  sectionId?: InputMaybe<Scalars['ID']>;
}>;


export type CreateNotebookMutation = { __typename?: 'Mutation', createPad: { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, isPublic?: boolean | null, initialState?: string | null, status?: string | null, createdAt?: any | null, archived?: boolean | null, access: { __typename?: 'PadAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user: { __typename?: 'User', id: string, name: string, email?: string | null } }> | null }, workspace?: { __typename?: 'Workspace', id: string, name: string } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, snapshots: Array<{ __typename?: 'PadSnapshot', snapshotName: string, createdAt?: any | null, updatedAt?: any | null, data?: string | null, version?: string | null }>, section?: { __typename?: 'Section', id: string, name: string } | null } };

export type CreateSectionMutationVariables = Exact<{
  workspaceId: Scalars['ID'];
  name: Scalars['String'];
  color: Scalars['String'];
}>;


export type CreateSectionMutation = { __typename?: 'Mutation', addSectionToWorkspace?: { __typename?: 'Section', id: string, name: string, color: string, createdAt?: any | null } | null };

export type CreateOrUpdateNotebookSnapshotMutationVariables = Exact<{
  notebookId: Scalars['ID'];
  snapshotName: Scalars['String'];
}>;


export type CreateOrUpdateNotebookSnapshotMutation = { __typename?: 'Mutation', createOrUpdateSnapshot: { __typename?: 'Pad', id: string, snapshots: Array<{ __typename?: 'PadSnapshot', snapshotName: string, createdAt?: any | null, updatedAt?: any | null, data?: string | null, version?: string | null }> } };

export type CreateWorkspaceMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type CreateWorkspaceMutation = { __typename?: 'Mutation', createWorkspace: { __typename?: 'Workspace', id: string, name: string, pads: { __typename?: 'PagedPadResult', items: Array<{ __typename?: 'Pad', id: string, name: string, icon?: string | null, status?: string | null, createdAt?: any | null, archived?: boolean | null, isPublic?: boolean | null, section?: { __typename?: 'Section', id: string, name: string } | null }> }, sections: Array<{ __typename?: 'Section', id: string, name: string, color: string, createdAt?: any | null, pads: Array<{ __typename?: 'Pad', id: string, name: string, icon?: string | null, status?: string | null, createdAt?: any | null, archived?: boolean | null, isPublic?: boolean | null, section?: { __typename?: 'Section', id: string, name: string } | null }> }> } };

export type DeleteNotebookMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteNotebookMutation = { __typename?: 'Mutation', removePad?: boolean | null };

export type DeleteSectionMutationVariables = Exact<{
  workspaceId: Scalars['ID'];
  sectionId: Scalars['ID'];
}>;


export type DeleteSectionMutation = { __typename?: 'Mutation', removeSectionFromWorkspace?: boolean | null };

export type DeleteWorkspaceMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteWorkspaceMutation = { __typename?: 'Mutation', removeWorkspace?: boolean | null };

export type DuplicateNotebookMutationVariables = Exact<{
  id: Scalars['ID'];
  targetWorkspace: Scalars['ID'];
  document?: InputMaybe<Scalars['String']>;
}>;


export type DuplicateNotebookMutation = { __typename?: 'Mutation', duplicatePad: { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, isPublic?: boolean | null, initialState?: string | null, status?: string | null, createdAt?: any | null, archived?: boolean | null, access: { __typename?: 'PadAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user: { __typename?: 'User', id: string, name: string, email?: string | null } }> | null }, workspace?: { __typename?: 'Workspace', id: string, name: string } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, snapshots: Array<{ __typename?: 'PadSnapshot', snapshotName: string, createdAt?: any | null, updatedAt?: any | null, data?: string | null, version?: string | null }>, section?: { __typename?: 'Section', id: string, name: string } | null } };

export type FulfilGoalMutationVariables = Exact<{
  props: GoalFulfilmentInput;
}>;


export type FulfilGoalMutation = { __typename?: 'Mutation', fulfilGoal: boolean };

export type ImportNotebookMutationVariables = Exact<{
  workspaceId: Scalars['ID'];
  source: Scalars['String'];
}>;


export type ImportNotebookMutation = { __typename?: 'Mutation', importPad: { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, isPublic?: boolean | null, initialState?: string | null, status?: string | null, createdAt?: any | null, archived?: boolean | null, access: { __typename?: 'PadAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user: { __typename?: 'User', id: string, name: string, email?: string | null } }> | null }, workspace?: { __typename?: 'Workspace', id: string, name: string } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, snapshots: Array<{ __typename?: 'PadSnapshot', snapshotName: string, createdAt?: any | null, updatedAt?: any | null, data?: string | null, version?: string | null }>, section?: { __typename?: 'Section', id: string, name: string } | null } };

export type MoveNotebookMutationVariables = Exact<{
  id: Scalars['ID'];
  workspaceId: Scalars['ID'];
}>;


export type MoveNotebookMutation = { __typename?: 'Mutation', movePad: { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, isPublic?: boolean | null, initialState?: string | null, status?: string | null, createdAt?: any | null, archived?: boolean | null, access: { __typename?: 'PadAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user: { __typename?: 'User', id: string, name: string, email?: string | null } }> | null }, workspace?: { __typename?: 'Workspace', id: string, name: string } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, snapshots: Array<{ __typename?: 'PadSnapshot', snapshotName: string, createdAt?: any | null, updatedAt?: any | null, data?: string | null, version?: string | null }>, section?: { __typename?: 'Section', id: string, name: string } | null } };

export type RenameNotebookMutationVariables = Exact<{
  id: Scalars['ID'];
  name: Scalars['String'];
}>;


export type RenameNotebookMutation = { __typename?: 'Mutation', updatePad: { __typename?: 'Pad', id: string, name: string } };

export type RenameWorkspaceMutationVariables = Exact<{
  id: Scalars['ID'];
  name: Scalars['String'];
}>;


export type RenameWorkspaceMutation = { __typename?: 'Mutation', updateWorkspace: { __typename?: 'Workspace', id: string, name: string } };

export type SetNotebookPublicMutationVariables = Exact<{
  id: Scalars['ID'];
  isPublic: Scalars['Boolean'];
}>;


export type SetNotebookPublicMutation = { __typename?: 'Mutation', setPadPublic: { __typename?: 'Pad', id: string, isPublic?: boolean | null } };

export type SetUsernameMutationVariables = Exact<{
  props: UsernameInput;
}>;


export type SetUsernameMutation = { __typename?: 'Mutation', setUsername: boolean };

export type ShareNotebookWithSecretMutationVariables = Exact<{
  id: Scalars['ID'];
  permissionType: PermissionType;
  canComment: Scalars['Boolean'];
}>;


export type ShareNotebookWithSecretMutation = { __typename?: 'Mutation', sharePadWithSecret: string };

export type SharePadWithEmailMutationVariables = Exact<{
  padId: Scalars['ID'];
  email: Scalars['String'];
  permissionType: PermissionType;
  canComment: Scalars['Boolean'];
}>;


export type SharePadWithEmailMutation = { __typename?: 'Mutation', sharePadWithEmail: { __typename?: 'Pad', id: string, name: string, access: { __typename?: 'PadAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, canComment: boolean, user: { __typename?: 'User', id: string, image?: string | null, name: string, email?: string | null, username?: string | null } }> | null } } };

export type UnarchiveNotebookMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type UnarchiveNotebookMutation = { __typename?: 'Mutation', updatePad: { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, isPublic?: boolean | null, initialState?: string | null, access: { __typename?: 'PadAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user: { __typename?: 'User', id: string, name: string, email?: string | null } }> | null }, workspace?: { __typename?: 'Workspace', id: string, name: string } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, snapshots: Array<{ __typename?: 'PadSnapshot', snapshotName: string, createdAt?: any | null, updatedAt?: any | null, data?: string | null, version?: string | null }> } };

export type UnshareNotebookWithSecretMutationVariables = Exact<{
  id: Scalars['ID'];
  secret: Scalars['String'];
}>;


export type UnshareNotebookWithSecretMutation = { __typename?: 'Mutation', unshareNotebookWithSecret?: boolean | null };

export type UpdateNotebookArchiveMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type UpdateNotebookArchiveMutation = { __typename?: 'Mutation', updatePad: { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, isPublic?: boolean | null, initialState?: string | null, access: { __typename?: 'PadAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user: { __typename?: 'User', id: string, name: string, email?: string | null } }> | null }, workspace?: { __typename?: 'Workspace', id: string, name: string } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, snapshots: Array<{ __typename?: 'PadSnapshot', snapshotName: string, createdAt?: any | null, updatedAt?: any | null, data?: string | null, version?: string | null }> } };

export type UpdateNotebookIconMutationVariables = Exact<{
  id: Scalars['ID'];
  icon: Scalars['String'];
}>;


export type UpdateNotebookIconMutation = { __typename?: 'Mutation', updatePad: { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, isPublic?: boolean | null, initialState?: string | null, access: { __typename?: 'PadAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user: { __typename?: 'User', id: string, name: string, email?: string | null } }> | null }, workspace?: { __typename?: 'Workspace', id: string, name: string } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, snapshots: Array<{ __typename?: 'PadSnapshot', snapshotName: string, createdAt?: any | null, updatedAt?: any | null, data?: string | null, version?: string | null }> } };

export type UpdateNotebookStatusMutationVariables = Exact<{
  id: Scalars['ID'];
  status: Scalars['String'];
}>;


export type UpdateNotebookStatusMutation = { __typename?: 'Mutation', updatePad: { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, isPublic?: boolean | null, initialState?: string | null, access: { __typename?: 'PadAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user: { __typename?: 'User', id: string, name: string, email?: string | null } }> | null }, workspace?: { __typename?: 'Workspace', id: string, name: string } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, snapshots: Array<{ __typename?: 'PadSnapshot', snapshotName: string, createdAt?: any | null, updatedAt?: any | null, data?: string | null, version?: string | null }> } };

export type UpdateSectionMutationVariables = Exact<{
  workspaceId: Scalars['ID'];
  sectionId: Scalars['ID'];
  name: Scalars['String'];
  color: Scalars['String'];
}>;


export type UpdateSectionMutation = { __typename?: 'Mutation', updateSectionInWorkspace?: boolean | null };

export type UpdateSectionAddNotebookMutationVariables = Exact<{
  sectionId: Scalars['ID'];
  notebookId: Scalars['ID'];
}>;


export type UpdateSectionAddNotebookMutation = { __typename?: 'Mutation', addNotebookToSection?: boolean | null };

export type UpdateUserMutationVariables = Exact<{
  props: UserInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateSelf: { __typename?: 'User', name: string, description?: string | null, hideChecklist?: boolean | null, onboarded?: boolean | null } };

export type NotebookSnapshotFragment = { __typename?: 'PadSnapshot', snapshotName: string, createdAt?: any | null, updatedAt?: any | null, data?: string | null, version?: string | null };

export type EditorNotebookFragment = { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, isPublic?: boolean | null, initialState?: string | null, access: { __typename?: 'PadAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user: { __typename?: 'User', id: string, name: string, email?: string | null } }> | null }, workspace?: { __typename?: 'Workspace', id: string, name: string } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, snapshots: Array<{ __typename?: 'PadSnapshot', snapshotName: string, createdAt?: any | null, updatedAt?: any | null, data?: string | null, version?: string | null }> };

export type GetNotebookByIdQueryVariables = Exact<{
  id: Scalars['ID'];
  snapshotName?: InputMaybe<Scalars['String']>;
}>;


export type GetNotebookByIdQuery = { __typename?: 'Query', getPadById?: { __typename?: 'Pad', id: string, name: string, myPermissionType?: PermissionType | null, icon?: string | null, isPublic?: boolean | null, initialState?: string | null, access: { __typename?: 'PadAccess', users?: Array<{ __typename?: 'UserAccess', permission: PermissionType, user: { __typename?: 'User', id: string, name: string, email?: string | null } }> | null }, workspace?: { __typename?: 'Workspace', id: string, name: string } | null, padConnectionParams: { __typename?: 'PadConnectionParams', url: string, token: string }, snapshots: Array<{ __typename?: 'PadSnapshot', snapshotName: string, createdAt?: any | null, updatedAt?: any | null, data?: string | null, version?: string | null }> } | null };

export type UserQueryVariables = Exact<{ [key: string]: never; }>;


export type UserQuery = { __typename?: 'Query', selfFulfilledGoals: Array<string>, self?: { __typename?: 'User', name: string, username?: string | null, description?: string | null, hideChecklist?: boolean | null, onboarded?: boolean | null } | null };

export type WorkspaceSwitcherWorkspaceFragment = { __typename?: 'Workspace', id: string, name: string };

export type GetWorkspacesIDsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkspacesIDsQuery = { __typename?: 'Query', workspaces: Array<{ __typename?: 'Workspace', id: string, name: string }> };

export type WorkspaceNotebookFragment = { __typename?: 'Pad', id: string, name: string, icon?: string | null, status?: string | null, createdAt?: any | null, archived?: boolean | null, isPublic?: boolean | null, section?: { __typename?: 'Section', id: string, name: string } | null };

export type WorkspaceSectionFragment = { __typename?: 'Section', id: string, name: string, color: string, createdAt?: any | null, pads: Array<{ __typename?: 'Pad', id: string, name: string, icon?: string | null, status?: string | null, createdAt?: any | null, archived?: boolean | null, isPublic?: boolean | null, section?: { __typename?: 'Section', id: string, name: string } | null }> };

export type DashboardWorkspaceFragment = { __typename?: 'Workspace', id: string, name: string, pads: { __typename?: 'PagedPadResult', items: Array<{ __typename?: 'Pad', id: string, name: string, icon?: string | null, status?: string | null, createdAt?: any | null, archived?: boolean | null, isPublic?: boolean | null, section?: { __typename?: 'Section', id: string, name: string } | null }> }, sections: Array<{ __typename?: 'Section', id: string, name: string, color: string, createdAt?: any | null, pads: Array<{ __typename?: 'Pad', id: string, name: string, icon?: string | null, status?: string | null, createdAt?: any | null, archived?: boolean | null, isPublic?: boolean | null, section?: { __typename?: 'Section', id: string, name: string } | null }> }> };

export type GetWorkspacesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkspacesQuery = { __typename?: 'Query', workspaces: Array<{ __typename?: 'Workspace', id: string, name: string, pads: { __typename?: 'PagedPadResult', items: Array<{ __typename?: 'Pad', id: string, name: string, icon?: string | null, status?: string | null, createdAt?: any | null, archived?: boolean | null, isPublic?: boolean | null, section?: { __typename?: 'Section', id: string, name: string } | null }> }, sections: Array<{ __typename?: 'Section', id: string, name: string, color: string, createdAt?: any | null, pads: Array<{ __typename?: 'Pad', id: string, name: string, icon?: string | null, status?: string | null, createdAt?: any | null, archived?: boolean | null, isPublic?: boolean | null, section?: { __typename?: 'Section', id: string, name: string } | null }> }> }> };

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
        id
        name
        email
      }
      permission
    }
  }
  workspace {
    id
    name
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
    ${NotebookSnapshotFragmentDoc}`;
export const WorkspaceSwitcherWorkspaceFragmentDoc = gql`
    fragment WorkspaceSwitcherWorkspace on Workspace {
  id
  name
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
export const DashboardWorkspaceFragmentDoc = gql`
    fragment DashboardWorkspace on Workspace {
  id
  name
  pads(page: {maxItems: 10000}) {
    items {
      ...WorkspaceNotebook
    }
  }
  sections {
    ...WorkspaceSection
  }
}
    ${WorkspaceNotebookFragmentDoc}
${WorkspaceSectionFragmentDoc}`;
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
  createOrUpdateSnapshot(notebookId: $notebookId, snapshotName: $snapshotName) {
    id
    snapshots {
      ...NotebookSnapshot
    }
  }
}
    ${NotebookSnapshotFragmentDoc}`;

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
  setPadPublic(id: $id, isPublic: $isPublic) {
    id
    isPublic
  }
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
          id
          image
          name
          email
          username
        }
      }
    }
  }
}
    `;

export function useSharePadWithEmailMutation() {
  return Urql.useMutation<SharePadWithEmailMutation, SharePadWithEmailMutationVariables>(SharePadWithEmailDocument);
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
}
    ${DashboardWorkspaceFragmentDoc}`;

export function useGetWorkspacesQuery(options?: Omit<Urql.UseQueryArgs<GetWorkspacesQueryVariables>, 'query'>) {
  return Urql.useQuery<GetWorkspacesQuery, GetWorkspacesQueryVariables>({ query: GetWorkspacesDocument, ...options });
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
  WorkspacesChanges?: (data: WithTypename<WorkspacesChanges>) => null | string
}

export type GraphCacheResolvers = {
  Query?: {
    getCreateAttachmentForm?: GraphCacheResolver<WithTypename<Query>, QueryGetCreateAttachmentFormArgs, WithTypename<CreateAttachmentForm> | string>,
    getExternalDataSource?: GraphCacheResolver<WithTypename<Query>, QueryGetExternalDataSourceArgs, WithTypename<ExternalDataSource> | string>,
    getExternalDataSources?: GraphCacheResolver<WithTypename<Query>, QueryGetExternalDataSourcesArgs, WithTypename<PagedResult> | string>,
    getPadById?: GraphCacheResolver<WithTypename<Query>, QueryGetPadByIdArgs, WithTypename<Pad> | string>,
    getWorkspaceById?: GraphCacheResolver<WithTypename<Query>, QueryGetWorkspaceByIdArgs, WithTypename<Workspace> | string>,
    me?: GraphCacheResolver<WithTypename<Query>, Record<string, never>, WithTypename<User> | string>,
    pads?: GraphCacheResolver<WithTypename<Query>, QueryPadsArgs, WithTypename<PagedPadResult> | string>,
    padsByTag?: GraphCacheResolver<WithTypename<Query>, QueryPadsByTagArgs, WithTypename<PagedPadResult> | string>,
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
    externalId?: GraphCacheResolver<WithTypename<ExternalDataSource>, Record<string, never>, Scalars['String'] | string>,
    id?: GraphCacheResolver<WithTypename<ExternalDataSource>, Record<string, never>, Scalars['ID'] | string>,
    name?: GraphCacheResolver<WithTypename<ExternalDataSource>, Record<string, never>, Scalars['String'] | string>,
    padId?: GraphCacheResolver<WithTypename<ExternalDataSource>, Record<string, never>, Scalars['ID'] | string>,
    provider?: GraphCacheResolver<WithTypename<ExternalDataSource>, Record<string, never>, ExternalProvider | string>
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
    createdAt?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, Scalars['DateTime'] | string>,
    id?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, Scalars['ID'] | string>,
    isPublic?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, Scalars['Boolean'] | string>,
    name?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, Scalars['String'] | string>,
    pads?: GraphCacheResolver<WithTypename<Workspace>, WorkspacePadsArgs, WithTypename<PagedPadResult> | string>,
    roles?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, Array<WithTypename<Role> | string>>,
    sections?: GraphCacheResolver<WithTypename<Workspace>, Record<string, never>, Array<WithTypename<Section> | string>>
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
  createOrUpdateSnapshot?: GraphCacheOptimisticMutationResolver<MutationCreateOrUpdateSnapshotArgs, WithTypename<Pad>>,
  createPad?: GraphCacheOptimisticMutationResolver<MutationCreatePadArgs, WithTypename<Pad>>,
  createRole?: GraphCacheOptimisticMutationResolver<MutationCreateRoleArgs, WithTypename<Role>>,
  createUserViaMagicLink?: GraphCacheOptimisticMutationResolver<MutationCreateUserViaMagicLinkArgs, WithTypename<User>>,
  createWorkspace?: GraphCacheOptimisticMutationResolver<MutationCreateWorkspaceArgs, WithTypename<Workspace>>,
  doNothing?: GraphCacheOptimisticMutationResolver<Record<string, never>, Maybe<Scalars['Boolean']>>,
  duplicatePad?: GraphCacheOptimisticMutationResolver<MutationDuplicatePadArgs, WithTypename<Pad>>,
  fulfilGoal?: GraphCacheOptimisticMutationResolver<MutationFulfilGoalArgs, Scalars['Boolean']>,
  importPad?: GraphCacheOptimisticMutationResolver<MutationImportPadArgs, WithTypename<Pad>>,
  inviteUserToRole?: GraphCacheOptimisticMutationResolver<MutationInviteUserToRoleArgs, Array<WithTypename<RoleInvitation>>>,
  movePad?: GraphCacheOptimisticMutationResolver<MutationMovePadArgs, WithTypename<Pad>>,
  pretendUser?: GraphCacheOptimisticMutationResolver<MutationPretendUserArgs, Maybe<Scalars['Boolean']>>,
  removeAttachmentFromPad?: GraphCacheOptimisticMutationResolver<MutationRemoveAttachmentFromPadArgs, Maybe<Scalars['Boolean']>>,
  removeExternalDataSource?: GraphCacheOptimisticMutationResolver<MutationRemoveExternalDataSourceArgs, Maybe<Scalars['Boolean']>>,
  removePad?: GraphCacheOptimisticMutationResolver<MutationRemovePadArgs, Maybe<Scalars['Boolean']>>,
  removeRole?: GraphCacheOptimisticMutationResolver<MutationRemoveRoleArgs, Maybe<Scalars['Boolean']>>,
  removeSectionFromWorkspace?: GraphCacheOptimisticMutationResolver<MutationRemoveSectionFromWorkspaceArgs, Maybe<Scalars['Boolean']>>,
  removeSelfFromRole?: GraphCacheOptimisticMutationResolver<MutationRemoveSelfFromRoleArgs, Maybe<Scalars['Boolean']>>,
  removeTagFromPad?: GraphCacheOptimisticMutationResolver<MutationRemoveTagFromPadArgs, Maybe<Scalars['Boolean']>>,
  removeUserFromRole?: GraphCacheOptimisticMutationResolver<MutationRemoveUserFromRoleArgs, Maybe<Scalars['Boolean']>>,
  removeWorkspace?: GraphCacheOptimisticMutationResolver<MutationRemoveWorkspaceArgs, Maybe<Scalars['Boolean']>>,
  resendRegistrationMagicLinkEmail?: GraphCacheOptimisticMutationResolver<MutationResendRegistrationMagicLinkEmailArgs, Maybe<Scalars['Boolean']>>,
  setPadPublic?: GraphCacheOptimisticMutationResolver<MutationSetPadPublicArgs, WithTypename<Pad>>,
  setUsername?: GraphCacheOptimisticMutationResolver<MutationSetUsernameArgs, Scalars['Boolean']>,
  shareExternalDataSourceWithEmail?: GraphCacheOptimisticMutationResolver<MutationShareExternalDataSourceWithEmailArgs, Maybe<WithTypename<ExternalDataSource>>>,
  shareExternalDataSourceWithRole?: GraphCacheOptimisticMutationResolver<MutationShareExternalDataSourceWithRoleArgs, Maybe<Scalars['Boolean']>>,
  shareExternalDataSourceWithUser?: GraphCacheOptimisticMutationResolver<MutationShareExternalDataSourceWithUserArgs, Maybe<Scalars['Boolean']>>,
  sharePadWithEmail?: GraphCacheOptimisticMutationResolver<MutationSharePadWithEmailArgs, WithTypename<Pad>>,
  sharePadWithRole?: GraphCacheOptimisticMutationResolver<MutationSharePadWithRoleArgs, Maybe<Scalars['Boolean']>>,
  sharePadWithSecret?: GraphCacheOptimisticMutationResolver<MutationSharePadWithSecretArgs, Scalars['String']>,
  sharePadWithUser?: GraphCacheOptimisticMutationResolver<MutationSharePadWithUserArgs, Maybe<Scalars['Boolean']>>,
  unshareExternalDataSourceWithRole?: GraphCacheOptimisticMutationResolver<MutationUnshareExternalDataSourceWithRoleArgs, Maybe<Scalars['Boolean']>>,
  unshareExternalDataSourceWithUser?: GraphCacheOptimisticMutationResolver<MutationUnshareExternalDataSourceWithUserArgs, Maybe<Scalars['Boolean']>>,
  unshareNotebookWithSecret?: GraphCacheOptimisticMutationResolver<MutationUnshareNotebookWithSecretArgs, Maybe<Scalars['Boolean']>>,
  unsharePadWithRole?: GraphCacheOptimisticMutationResolver<MutationUnsharePadWithRoleArgs, Maybe<Scalars['Boolean']>>,
  unsharePadWithUser?: GraphCacheOptimisticMutationResolver<MutationUnsharePadWithUserArgs, Maybe<Scalars['Boolean']>>,
  updateExternalDataSource?: GraphCacheOptimisticMutationResolver<MutationUpdateExternalDataSourceArgs, Maybe<WithTypename<ExternalDataSource>>>,
  updatePad?: GraphCacheOptimisticMutationResolver<MutationUpdatePadArgs, WithTypename<Pad>>,
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
    createOrUpdateSnapshot?: GraphCacheUpdateResolver<{ createOrUpdateSnapshot: WithTypename<Pad> }, MutationCreateOrUpdateSnapshotArgs>,
    createPad?: GraphCacheUpdateResolver<{ createPad: WithTypename<Pad> }, MutationCreatePadArgs>,
    createRole?: GraphCacheUpdateResolver<{ createRole: WithTypename<Role> }, MutationCreateRoleArgs>,
    createUserViaMagicLink?: GraphCacheUpdateResolver<{ createUserViaMagicLink: WithTypename<User> }, MutationCreateUserViaMagicLinkArgs>,
    createWorkspace?: GraphCacheUpdateResolver<{ createWorkspace: WithTypename<Workspace> }, MutationCreateWorkspaceArgs>,
    doNothing?: GraphCacheUpdateResolver<{ doNothing: Maybe<Scalars['Boolean']> }, Record<string, never>>,
    duplicatePad?: GraphCacheUpdateResolver<{ duplicatePad: WithTypename<Pad> }, MutationDuplicatePadArgs>,
    fulfilGoal?: GraphCacheUpdateResolver<{ fulfilGoal: Scalars['Boolean'] }, MutationFulfilGoalArgs>,
    importPad?: GraphCacheUpdateResolver<{ importPad: WithTypename<Pad> }, MutationImportPadArgs>,
    inviteUserToRole?: GraphCacheUpdateResolver<{ inviteUserToRole: Array<WithTypename<RoleInvitation>> }, MutationInviteUserToRoleArgs>,
    movePad?: GraphCacheUpdateResolver<{ movePad: WithTypename<Pad> }, MutationMovePadArgs>,
    pretendUser?: GraphCacheUpdateResolver<{ pretendUser: Maybe<Scalars['Boolean']> }, MutationPretendUserArgs>,
    removeAttachmentFromPad?: GraphCacheUpdateResolver<{ removeAttachmentFromPad: Maybe<Scalars['Boolean']> }, MutationRemoveAttachmentFromPadArgs>,
    removeExternalDataSource?: GraphCacheUpdateResolver<{ removeExternalDataSource: Maybe<Scalars['Boolean']> }, MutationRemoveExternalDataSourceArgs>,
    removePad?: GraphCacheUpdateResolver<{ removePad: Maybe<Scalars['Boolean']> }, MutationRemovePadArgs>,
    removeRole?: GraphCacheUpdateResolver<{ removeRole: Maybe<Scalars['Boolean']> }, MutationRemoveRoleArgs>,
    removeSectionFromWorkspace?: GraphCacheUpdateResolver<{ removeSectionFromWorkspace: Maybe<Scalars['Boolean']> }, MutationRemoveSectionFromWorkspaceArgs>,
    removeSelfFromRole?: GraphCacheUpdateResolver<{ removeSelfFromRole: Maybe<Scalars['Boolean']> }, MutationRemoveSelfFromRoleArgs>,
    removeTagFromPad?: GraphCacheUpdateResolver<{ removeTagFromPad: Maybe<Scalars['Boolean']> }, MutationRemoveTagFromPadArgs>,
    removeUserFromRole?: GraphCacheUpdateResolver<{ removeUserFromRole: Maybe<Scalars['Boolean']> }, MutationRemoveUserFromRoleArgs>,
    removeWorkspace?: GraphCacheUpdateResolver<{ removeWorkspace: Maybe<Scalars['Boolean']> }, MutationRemoveWorkspaceArgs>,
    resendRegistrationMagicLinkEmail?: GraphCacheUpdateResolver<{ resendRegistrationMagicLinkEmail: Maybe<Scalars['Boolean']> }, MutationResendRegistrationMagicLinkEmailArgs>,
    setPadPublic?: GraphCacheUpdateResolver<{ setPadPublic: WithTypename<Pad> }, MutationSetPadPublicArgs>,
    setUsername?: GraphCacheUpdateResolver<{ setUsername: Scalars['Boolean'] }, MutationSetUsernameArgs>,
    shareExternalDataSourceWithEmail?: GraphCacheUpdateResolver<{ shareExternalDataSourceWithEmail: Maybe<WithTypename<ExternalDataSource>> }, MutationShareExternalDataSourceWithEmailArgs>,
    shareExternalDataSourceWithRole?: GraphCacheUpdateResolver<{ shareExternalDataSourceWithRole: Maybe<Scalars['Boolean']> }, MutationShareExternalDataSourceWithRoleArgs>,
    shareExternalDataSourceWithUser?: GraphCacheUpdateResolver<{ shareExternalDataSourceWithUser: Maybe<Scalars['Boolean']> }, MutationShareExternalDataSourceWithUserArgs>,
    sharePadWithEmail?: GraphCacheUpdateResolver<{ sharePadWithEmail: WithTypename<Pad> }, MutationSharePadWithEmailArgs>,
    sharePadWithRole?: GraphCacheUpdateResolver<{ sharePadWithRole: Maybe<Scalars['Boolean']> }, MutationSharePadWithRoleArgs>,
    sharePadWithSecret?: GraphCacheUpdateResolver<{ sharePadWithSecret: Scalars['String'] }, MutationSharePadWithSecretArgs>,
    sharePadWithUser?: GraphCacheUpdateResolver<{ sharePadWithUser: Maybe<Scalars['Boolean']> }, MutationSharePadWithUserArgs>,
    unshareExternalDataSourceWithRole?: GraphCacheUpdateResolver<{ unshareExternalDataSourceWithRole: Maybe<Scalars['Boolean']> }, MutationUnshareExternalDataSourceWithRoleArgs>,
    unshareExternalDataSourceWithUser?: GraphCacheUpdateResolver<{ unshareExternalDataSourceWithUser: Maybe<Scalars['Boolean']> }, MutationUnshareExternalDataSourceWithUserArgs>,
    unshareNotebookWithSecret?: GraphCacheUpdateResolver<{ unshareNotebookWithSecret: Maybe<Scalars['Boolean']> }, MutationUnshareNotebookWithSecretArgs>,
    unsharePadWithRole?: GraphCacheUpdateResolver<{ unsharePadWithRole: Maybe<Scalars['Boolean']> }, MutationUnsharePadWithRoleArgs>,
    unsharePadWithUser?: GraphCacheUpdateResolver<{ unsharePadWithUser: Maybe<Scalars['Boolean']> }, MutationUnsharePadWithUserArgs>,
    updateExternalDataSource?: GraphCacheUpdateResolver<{ updateExternalDataSource: Maybe<WithTypename<ExternalDataSource>> }, MutationUpdateExternalDataSourceArgs>,
    updatePad?: GraphCacheUpdateResolver<{ updatePad: WithTypename<Pad> }, MutationUpdatePadArgs>,
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