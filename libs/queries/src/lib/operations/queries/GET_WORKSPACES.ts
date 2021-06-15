import { gql } from '@apollo/client';

export const GET_WORKSPACES = gql`
  query Workspaces {
    workspaces {
      id
      name
    }
  }
`;
