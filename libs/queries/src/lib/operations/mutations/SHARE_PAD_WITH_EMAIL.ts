import { gql, useMutation } from '@apollo/client';
import {
  SharePadWithEmail,
  SharePadWithEmailVariables,
} from './__generated__/SharePadWithEmail';

export const SHARE_PAD_WITH_EMAIL = gql`
  mutation SharePadWithEmail(
    $id: ID!
    $email: String!
    $permissionType: PermissionType!
    $canComment: Boolean!
  ) {
    sharePadWithEmail(
      id: $id
      email: $email
      permissionType: $permissionType
      canComment: $canComment
    )
  }
`;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useSharePadWithEmail = () =>
  useMutation<SharePadWithEmail, SharePadWithEmailVariables>(
    SHARE_PAD_WITH_EMAIL,
    {
      refetchQueries: [],
      awaitRefetchQueries: true,
    }
  );
