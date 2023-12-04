import { gql } from 'apollo-server-lambda';

export default gql`
  type ResourceUsage {
    id: ID!
    resourceType: String! # openai
    consumption: Int!
    quotaLimit: Int!
  }

  extend type User {
    # An array because we can use various AI Models
    resourceUsages: [ResourceUsage]
  }

  extend type Workspace {
    # An array because we can use various AI Models
    resourceUsages: [ResourceUsage]
  }
`;
