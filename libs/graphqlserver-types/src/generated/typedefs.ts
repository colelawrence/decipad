
import { gql } from "apollo-server-lambda";

export default gql`
type ResourceAccess {
  # ID is the same as the parent ID.
  id: ID!
  roles: [RoleAccess!]!
  users: [UserAccess!]!
}
type KeyValue {
  key: String!
  value: String!
}

type CreateAttachmentForm {
  url: String!
  handle: String!
  fields: [KeyValue!]!
}

type Attachment {
  id: ID!
  fileName: String!
  fileType: String!
  fileSize: Int!
  userId: String
  uploadedBy: User
  createdAt: DateTime
  url: String!
  padId: String!
  pad: Pad
}

extend type Mutation {
  getCreateAttachmentForm(
    padId: ID!
    fileName: String!
    fileType: String!
  ): CreateAttachmentForm!
  attachFileToPad(handle: ID!): Attachment
  removeAttachmentFromPad(attachmentId: ID!): Boolean
}

extend type Pad {
  attachments: [Attachment!]!
}
extend type Mutation {
  pretendUser(userId: ID!): Boolean
}
type Query {
  version: String
}

type Mutation {
  doNothing: Boolean
}

type Subscription {
  subscribeToNothing: Boolean
}
scalar DateTime
enum ExternalProvider {
  decipad
  gsheets
  csv
  json
  postgresql
  mysql
  oracledb
  cockroachdb
  redshift
  mariadb
  mssql
  notion
}

type ExternalKey {
  id: ID!
  lastError: String
  createdAt: DateTime!
  expiresAt: DateTime
  lastUsedAt: DateTime
}

input ExternalDataSourceCreateInput {
  name: String!
  workspace_id: ID
  padId: ID
  provider: ExternalProvider!
  externalId: String!
  dataSourceName: String
}

input ExternalDataSourceUpdateInput {
  name: String
  dataSourceName: String
  externalId: String
}

type ExternalDataSource {
  id: ID!
  name: String!
  dataSourceName: String
  workspace_id: ID
  padId: ID
  provider: ExternalProvider!
  dataUrl: String
  authUrl: String
  externalId: String
  access: ResourceAccess!
  keys: [ExternalKey!]!
}

extend type Query {
  getExternalDataSource(id: ID!): ExternalDataSource!
  getExternalDataSources(notebookId: ID!, page: PageInput!): PagedResult!
  getExternalDataSourcesWorkspace(
    workspaceId: ID!
    page: PageInput!
  ): PagedResult!
}

extend type Mutation {
  createExternalDataSource(
    dataSource: ExternalDataSourceCreateInput!
  ): ExternalDataSource

  removeExternalDataSource(id: ID!): Boolean

  updateExternalDataSource(
    id: ID!
    dataSource: ExternalDataSourceUpdateInput!
  ): ExternalDataSource

  shareExternalDataSourceWithRole(
    id: ID!
    roleId: ID!
    permissionType: PermissionType!
  ): Boolean

  unshareExternalDataSourceWithRole(id: ID!, roleId: ID!): Boolean

  shareExternalDataSourceWithUser(
    id: ID!
    userId: ID!
    permissionType: PermissionType!
  ): ExternalDataSource

  unshareExternalDataSourceWithUser(id: ID!, userId: ID!): ExternalDataSource!

  shareExternalDataSourceWithEmail(
    id: ID!
    email: String!
    permissionType: PermissionType!
  ): ExternalDataSource
}
type User {
  id: ID!
  name: String!
  username: String
  description: String
  email: String
  image: String
  createdAt: DateTime
  hideChecklist: Boolean
  onboarded: Boolean
  emailValidatedAt: DateTime
}

enum PermissionType {
  READ
  WRITE
  ADMIN
}

type Permission {
  id: ID!
  resource: String!
  user: User!
  type: PermissionType!
  givenBy: User!
  canComment: Boolean!
  createdAt: DateTime
}

extend type Query {
  me: User
}
extend type Subscription {
  hello: String
}
input LogEntry {
  source: String!
  createdAt: DateTime!
  content: String!
}

input LogInput {
  resource: String!
  entries: [LogEntry!]!
}

extend type Mutation {
  createLogs(input: LogInput!): Boolean
}
extend type Query {
  getNotion(url: String!, notebookId: ID!): String!
}
input PadInput {
  name: String
  icon: String
  status: String
  archived: Boolean
  section_id: String
  tags: [String!]
  isTemplate: Boolean
}

type SecretAccess {
  secret: String!
  permission: PermissionType!
  canComment: Boolean!
}

type PadConnectionParams {
  url: String!
  token: String!
}

type Pad {
  id: ID!
  name: String!
  access: ResourceAccess!
  myPermissionType: PermissionType

  # Helps with resolvers and frontend.
  workspaceId: ID
  workspace: Workspace
  createdAt: DateTime!
  isPublic: Boolean
  icon: String
  status: String
  archived: Boolean

  # Helps with resolvers and frontend.
  sectionId: ID
  section: Section
  padConnectionParams: PadConnectionParams!
  initialState: String
  snapshots: [PadSnapshot!]!
  document: String!
  isTemplate: Boolean
}

type PagedPadResult {
  items: [Pad!]!
  count: Int!
  hasNextPage: Boolean!
  cursor: String
}

type PadChanges {
  added: [Pad!]!
  removed: [ID!]!
  updated: [Pad!]!
}

type PadSnapshot {
  snapshotName: String!
  createdAt: DateTime
  updatedAt: DateTime
  data: String
  version: String
}

input CreateOrUpdateSnapshotInput {
  notebookId: ID!
  snapshotName: String!
  remoteState: String
  localVersionHash: String # For caching use on the frontend
  forceSearchIndexUpdate: Boolean
}

extend type Query {
  getPadById(id: ID!, snapshotName: String): Pad
  pads(workspaceId: ID!, page: PageInput!): PagedPadResult!
  padsSharedWithMe(page: PageInput!): PagedPadResult!
  featuredPad: Pad
  searchTemplates(query: String!, page: PageInput!): PagedPadResult!
}

extend type Mutation {
  createPad(workspaceId: ID!, pad: PadInput!, sectionId: ID): Pad!
  updatePad(id: ID!, pad: PadInput!): Pad!
  removePad(id: ID!): Boolean
  duplicatePad(id: ID!, targetWorkspace: ID!, document: String): Pad!
  importPad(workspaceId: ID!, source: String!): Pad!
  movePad(id: ID!, workspaceId: ID!): Pad!

  setPadPublic(id: ID!, isPublic: Boolean!): Boolean!

  sharePadWithRole(
    id: ID!
    roleId: ID!
    permissionType: PermissionType!
    canComment: Boolean!
  ): Boolean

  unsharePadWithRole(id: ID!, roleId: ID!): Boolean

  sharePadWithUser(
    id: ID!
    userId: ID!
    permissionType: PermissionType!
    canComment: Boolean!
  ): Pad

  unsharePadWithUser(id: ID!, userId: ID!): Pad

  sharePadWithEmail(
    id: ID!
    email: String!
    permissionType: PermissionType!
    canComment: Boolean!
  ): Pad!

  sharePadWithSecret(
    id: ID!
    permissionType: PermissionType!
    canComment: Boolean!
  ): String!

  unshareNotebookWithSecret(id: ID!, secret: String!): Boolean

  createOrUpdateSnapshot(params: CreateOrUpdateSnapshotInput!): Boolean!

  createSnapshot(notebookId: ID!): Boolean!
}

extend type Subscription {
  padsChanged(workspaceId: ID!): PadChanges!
}

extend type Section {
  pads: [Pad!]!
}
input PageInput {
  cursor: String
  maxItems: Int!
}

type PagedResult {
  items: [Pageable!]!
  count: Int!
  hasNextPage: Boolean!
  cursor: String
}

union Pageable = SharedResource | ExternalDataSource
extend type Mutation {
  createUserViaMagicLink(email: String!): User!
  resendRegistrationMagicLinkEmail(email: String!): Boolean
}
type ResourceUsage {
  id: ID!
  resourceType: String! # openai
  consumption: Int!
  quotaLimit: Int!
}

type NewResourceQuotaLimit {
  newQuotaLimit: Int!
}

extend type Mutation {
  updateExtraAiAllowance(
    resourceType: String!
    resourceId: String!
    paymentMethodId: String!
  ): NewResourceQuotaLimit
}

extend type User {
  # An array because we can use various AI Models
  resourceUsages: [ResourceUsage]
}

extend type Workspace {
  # An array because we can use various AI Models
  resourceUsages: [ResourceUsage]
}
input RoleInput {
  name: String!
  workspaceId: ID!
}

type Role {
  id: ID!
  name: String!
  # Helps with resolvers
  workspaceId: String!
  workspace: Workspace!
  users: [User!]!
  createdAt: DateTime
}

type RoleInvitation {
  id: ID!
  role: Role!
  user: User!
  expires_at: DateTime
}

type RoleAccess {
  roleId: ID!
  role: Role!
  permission: PermissionType!
  canComment: Boolean!
}

extend type Mutation {
  createRole(role: RoleInput!): Role!

  removeRole(roleId: ID!): Boolean

  inviteUserToRole(
    roleId: ID!
    userId: ID!
    permission: PermissionType!
  ): [RoleInvitation!]!

  removeUserFromRole(roleId: ID!, userId: ID!): Boolean

  removeSelfFromRole(roleId: ID!): Boolean
}
input SecretInput {
  name: String!
  secret: String!
}

type Secret {
  id: ID!
  name: String!
  workspace: Workspace
}

extend type Query {
  getWorkspaceSecrets(workspaceId: ID!): [Secret!]!
}

extend type Mutation {
  createSecret(workspaceId: ID!, secret: SecretInput!): Secret!
  updateSecret(secretId: ID!, secret: String!): Secret!
  removeSecret(secretId: ID!): Boolean!
}
input SectionInput {
  name: String
  color: String
}

type Section {
  id: ID!
  name: String!
  color: String!
  pads: [Pad!]!
  workspace_id: ID!
  createdAt: DateTime
}

extend type Query {
  sections(workspaceId: ID!): [Section!]!
}

extend type Mutation {
  addSectionToWorkspace(workspaceId: ID!, section: SectionInput!): Section
  addNotebookToSection(sectionId: ID!, notebookId: ID!): Boolean
  removeSectionFromWorkspace(workspaceId: ID!, sectionId: ID!): Boolean
  updateSectionInWorkspace(
    workspaceId: ID!
    sectionId: ID!
    section: SectionInput!
  ): Boolean
}

type SectionChanges {
  added: [Section!]!
  removed: [ID!]!
  updated: [Section!]!
}

extend type Workspace {
  sections: [Section!]!
}

extend type Subscription {
  sectionsChanged(workspaceId: ID!): SectionChanges!
}
type SharedResource {
  resource: String!
  permission: PermissionType!
  canComment: Boolean
}

type ShareInvitation {
  email: String
}

type SharedWithUser {
  user: User!
  permissionType: PermissionType!
  canComment: Boolean!
}

type SharedWithRole {
  role: Role!
  permissionType: PermissionType!
  canComment: Boolean!
}

type SharedWith {
  users: [SharedWithUser!]!
  roles: [SharedWithRole!]!
  pendingInvitations: [ShareInvitation!]!
}

type ShareWithEmailInput {
  id: ID!
  email: String!
  permissionType: PermissionType!
}

type ShareWithRoleInput {
  id: ID!
  roleId: ID!
  permissionType: PermissionType!
}

type ShareWithRoleInput {
  id: ID!
  roleId: ID!
  permissionType: PermissionType!
}

type ShareWithSecretInput {
  id: ID!
  permissionType: PermissionType!
}

type ShareWithUserInput {
  id: ID!
  userId: ID!
  permissionType: PermissionType!
}

type UnshareWithRoleInput {
  id: ID!
  roleId: ID!
}

type UnshareWithUserInput {
  id: ID!
  userId: ID!
}
type TagRecord {
  tag: String!
  workspaceId: ID!
}

type TagChanges {
  added: [TagRecord!]!
  removed: [TagRecord!]!
}

extend type Query {
  tags(workspaceId: ID!): [String!]!
  padsByTag(workspaceId: ID!, tag: String!, page: PageInput!): PagedPadResult!
}

extend type Mutation {
  addTagToPad(padId: ID!, tag: String!): Boolean
  removeTagFromPad(padId: ID!, tag: String!): Boolean
}

extend type Pad {
  tags: [String!]!
}

extend type Subscription {
  tagsChanged(workspaceId: ID!): TagChanges!
}
input UserInput {
  name: String
  description: String
  hideChecklist: Boolean
  onboarded: Boolean
  image: String
}

type UserAccess {
  # Helps with resolvers
  userId: ID
  user: User
  permission: PermissionType!
  canComment: Boolean!
}

input GoalFulfilmentInput {
  goalName: String!
}

input UsernameInput {
  username: String!
}

extend type Query {
  self: User
  selfFulfilledGoals: [String!]!
}

extend type Mutation {
  updateSelf(props: UserInput!): User!
  fulfilGoal(props: GoalFulfilmentInput!): Boolean! ## returns false if already fulfilled
  setUsername(props: UsernameInput!): Boolean! ## returns false if another user with that name already exists
}
type WorkspaceExecutedQuery {
  id: ID!
  queryCount: Int!
  query_reset_date: DateTime
  quotaLimit: Int!
  workspace: Workspace
}

extend type Mutation {
  incrementQueryCount(id: ID!): WorkspaceExecutedQuery!
}

extend type Workspace {
  workspaceExecutedQuery: WorkspaceExecutedQuery
}
enum SubscriptionStatus {
  active
  canceled
  unpaid
  trialing
  incomplete
  incomplete_expired
  past_due
  paused
}

enum SubscriptionPaymentStatus {
  paid
  unpaid
  no_payment_required
}

type WorkspaceSubscription {
  id: String!
  customer_id: String
  paymentStatus: SubscriptionPaymentStatus!
  paymentLink: String!
  status: SubscriptionStatus
  workspace: Workspace
  seats: Int
}

extend type Mutation {
  syncWorkspaceSeats(id: ID!): WorkspaceSubscription!
}

extend type Workspace {
  workspaceSubscription: WorkspaceSubscription
}
input WorkspaceInput {
  name: String!
}

type WorkspaceAccess {
  id: ID!
  roles: [RoleAccess!]
  users: [UserAccess!]
}

type Workspace {
  id: ID!
  name: String!
  pads(page: PageInput!): PagedPadResult!
  sections: [Section!]!
  roles: [Role!]
  createdAt: DateTime
  isPublic: Boolean
  isPremium: Boolean
  myPermissionType: PermissionType
  access: WorkspaceAccess
  secrets: [Secret!]!
  membersCount: Int
}

type WorkspacesChanges {
  added: [Workspace!]!
  removed: [ID!]!
  updated: [Workspace!]!
}

extend type Query {
  getWorkspaceById(id: ID!): Workspace
  workspaces: [Workspace!]!
}

extend type Mutation {
  createWorkspace(workspace: WorkspaceInput!): Workspace!
  updateWorkspace(id: ID!, workspace: WorkspaceInput!): Workspace!
  removeWorkspace(id: ID!): Boolean
  shareWorkspaceWithEmail(
    id: ID!
    email: String!
    permissionType: PermissionType!
    canComment: Boolean!
  ): Workspace!
  unshareWorkspaceWithUser(id: ID!, userId: ID!): Workspace
}

extend type Subscription {
  workspacesChanged: WorkspacesChanges!
}
`;
