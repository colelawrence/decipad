/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AttachFileToPad
// ====================================================

export interface AttachFileToPad_attachFileToPad {
  __typename: "Attachment";
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
}

export interface AttachFileToPad {
  attachFileToPad: AttachFileToPad_attachFileToPad | null;
}

export interface AttachFileToPadVariables {
  handle: string;
}
