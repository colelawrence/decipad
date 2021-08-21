import { gql } from 'apollo-server-lambda';

export default gql`
  type KeyValue {
    key: String!
    value: String!
  }

  type CreateAttachmentForm {
    url: String!
    handle: String!
    fields: [KeyValue!]!
  }

  type Attachment {
    id: ID!
    fileName: String!
    fileType: String!
    fileSize: Int!
    uploadedBy: User
    createdAt: DateTime
    url: String!
    pad: Pad
  }

  extend type Query {
    getCreateAttachmentForm(
      padId: ID!
      fileName: String!
      fileType: String!
    ): CreateAttachmentForm!
  }

  extend type Mutation {
    attachFileToPad(handle: ID!): Attachment
    removeAttachmentFromPad(attachmentId: ID!): Boolean
  }

  extend type Pad {
    attachments: [Attachment!]!
  }
`;
