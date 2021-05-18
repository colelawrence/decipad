module.exports = ({ gql }) => gql`
  input RoleInput {
    name: String!
    workspace_id: ID!
    permission: PermissionType!
  }

  type Role {
    id: ID!
    name: String!
    workspace: Workspace!
    permission: PermissionType!
    users: [User!]!
  }

  type RoleInvitation {
    id: ID!
    role: Role!
    user: User!
    expires_at: Date
  }

  extend type Mutation {
    createRole(role: RoleInput): Role!

    removeRole(roleId: ID!): Boolean

    inviteUserToRole(
      roleId: ID!
      userId: ID!
      permission: PermissionType!
    ): [RoleInvitation!]!

    removeUserFromRole(roleId: ID!, userId: ID!): Boolean

    removeSelfFromRole(roleId: ID!): Boolean
  }
`;
