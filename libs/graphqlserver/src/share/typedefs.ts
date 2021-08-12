import { gql } from 'apollo-server-lambda';

export default gql`
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
`;
