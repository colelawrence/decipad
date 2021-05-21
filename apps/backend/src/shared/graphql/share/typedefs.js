module.exports = ({ gql }) => gql`
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

  extend type Query {
    resourceSharedWith(resource: String!): SharedWith!
    resourcesSharedWithMe(page: PageInput!, resourceType: String!): PagedResult!
  }

  extend type Mutation {
    shareWithRole(
      resource: String!
      roleId: ID!
      permissionType: PermissionType!
      canComment: Boolean!
    ): Boolean

    shareWithUser(
      resource: String!
      userId: ID!
      permissionType: PermissionType!
      canComment: Boolean!
    ): Boolean

    inviteToShareWithEmail(
      resource: String!
      email: String!
      permissionType: PermissionType!
      canComment: Boolean!
      resourceName: String!
    ): Boolean

    unShareWithRole(resource: String!, roleId: ID!): Boolean

    unShareWithUser(resource: String!, userId: ID!): Boolean
  }
`;
