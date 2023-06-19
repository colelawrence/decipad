import { gql } from 'apollo-server-lambda';

export default gql`
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
    padId: ID!
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
    padId: ID!
    provider: ExternalProvider!
    dataUrl: String
    authUrl: String
    access: ExternalDataSourceAccess!
    keys: [ExternalKey!]!
  }

  extend type Query {
    getExternalDataSource(id: ID!): ExternalDataSource!
    getExternalDataSources(notebookId: ID!, page: PageInput!): PagedResult!
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
      email: String
      permissionType: PermissionType!
    ): ExternalDataSource
  }
`;
