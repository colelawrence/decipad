import { gql, QueryResult, useQuery } from '@apollo/client';
import { GetWorkspaces } from './__generated__/GetWorkspaces';

export const GET_WORKSPACES = gql`
  query GetWorkspaces {
    workspaces {
      id
      name
      pads(page: { maxItems: 10000 }) {
        items {
          id
          name
          createdAt
        }
      }
    }
  }
`;

export const useGetWorkspaces = (): QueryResult<GetWorkspaces> =>
  useQuery<GetWorkspaces, never>(GET_WORKSPACES);
