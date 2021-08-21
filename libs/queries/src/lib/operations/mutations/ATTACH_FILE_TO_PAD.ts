import { gql } from '@apollo/client';

export const ATTACH_FILE_TO_PAD = gql`
  mutation AttachFileToPad($handle: ID!) {
    attachFileToPad(handle: $handle) {
      id
      fileName
      fileType
      fileSize
      url
    }
  }
`;
