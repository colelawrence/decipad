import { gql } from '@apollo/client';

export const GET_CREATE_ATTACHMENT_FORM = gql`
  query GetCreateAttachmentForm(
    $padId: ID!
    $fileName: String!
    $fileType: String!
  ) {
    getCreateAttachmentForm(
      padId: $padId
      fileName: $fileName
      fileType: $fileType
    ) {
      url
      handle
      fields {
        key
        value
      }
    }
  }
`;
