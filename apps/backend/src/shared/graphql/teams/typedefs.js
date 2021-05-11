module.exports = ({ gql }) => gql`
  type TeamUser {
    user: User!
    team: Team!
    permission: PermissionType!
  }

  type Team {
    id: ID!
    name: String!
    teamUsers: [TeamUser!]!
  }

  input TeamInput {
    name: String!
  }

  extend type Query {
    teams: [Team!]!
  }

  extend type Mutation {
    createTeam(team: TeamInput!): Team

    inviteUserToTeam(
      teamId: ID!
      userId: ID!
      permission: PermissionType!
    ): String

    removeUserFromTeam(teamId: ID!, userId: ID!): Boolean

    removeSelfFromTeam(teamId: ID!): Boolean

    removeTeam(teamId: ID!): Boolean
  }
`;
