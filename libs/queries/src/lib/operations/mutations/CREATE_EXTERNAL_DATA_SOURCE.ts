import { gql } from '@apollo/client';

export const CREATE_EXTERNAL_DATA_SOURCE = gql`
  mutation CreateExternalDataSource(
    $name: String!
    $padId: ID!
    $provider: ExternalProvider!
    $externalId: String!
  ) {
    createExternalDataSource(
      dataSource: {
        name: $name
        padId: $padId
        provider: $provider
        externalId: $externalId
      }
    ) {
      id
      dataUrl
      authUrl
    }
  }
`;
