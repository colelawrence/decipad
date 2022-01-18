import { gql, QueryHookOptions, QueryResult, useQuery } from '@apollo/client';

// eslint-disable-next-line no-shadow
export enum PermissionType {
  ADMIN = 'ADMIN',
  READ = 'READ',
  WRITE = 'WRITE',
}

const QUERY = gql`
  query GetPadById($id: ID!) {
    getPadById(id: $id) {
      id
      name
      myPermissionType
      access {
        users {
          user {
            id
            name
          }
          permission
        }
      }
      workspace {
        id
        name
      }
    }
  }
`;

interface User {
  user: {
    id: string;
    name: string;
  };
  permission: PermissionType;
}

interface Data {
  getPadById?: {
    __typename: 'Pad';
    id: string;
    name: string;
    myPermissionType: PermissionType;
    access: {
      users: User[];
    };
    workspace: {
      id: string;
      name: string;
    };
  };
}

interface Variables {
  id: string;
}

export const useGetPadById = (
  options: QueryHookOptions<Data, Variables>
): QueryResult<Data, Variables> => useQuery<Data, Variables>(QUERY, options);
