import { gql } from 'apollo-server-lambda';

export default gql`
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
`;
