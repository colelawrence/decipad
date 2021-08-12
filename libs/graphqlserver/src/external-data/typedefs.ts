import { gql } from 'apollo-server-lambda';

export default gql`
  enum ExternalProvider {
    googlesheets
    other
  }

  enum ExternalKeyStatus {
    NEW
    ACTIVE
    EXPIRED
    ERROR
  }

  type ExternalKey {
    id: ID!
    status: ExternalKeyStatus!
    lastError: String
    createdAt: DateTime!
    expiresAt: DateTime
    lastUsedAt: DateTime
  }

  input ExternalDataSourceCreateInput {
    name: String!
    provider: ExternalProvider!
    externalId: String!
  }

  input ExternalDataSourceUpdateInput {
    name: String
  }

  type ExternalDataSourceAccess {
    roles: [RoleAccess!]!
    users: [UserAccess!]!
  }

  type ExternalDataSource {
    id: ID!
    name: String!
    provider: ExternalProvider!
    externalId: String!
    dataPath: String!
    key: ExternalKey
    access: ExternalDataSourceAccess!
  }

  extend type Query {
    getExternalDataSource(id: ID!): ExternalDataSource!
    getExternalDataSources(page: PageInput!): PagedResult!
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
    ): Boolean

    unshareExternalDataSourceWithUser(id: ID!, userId: ID!): Boolean

    shareExternalDataSourceWithEmail(
      id: ID!
      email: String
      permissionType: PermissionType!
    ): Boolean
  }
`;
