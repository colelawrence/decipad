/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCreateAttachmentForm
// ====================================================

export interface GetCreateAttachmentForm_getCreateAttachmentForm_fields {
  __typename: 'KeyValue';
  key: string;
  value: string;
}

export interface GetCreateAttachmentForm_getCreateAttachmentForm {
  __typename: 'CreateAttachmentForm';
  url: string;
  handle: string;
  fields: GetCreateAttachmentForm_getCreateAttachmentForm_fields[];
}

export interface GetCreateAttachmentForm {
  getCreateAttachmentForm: GetCreateAttachmentForm_getCreateAttachmentForm;
}

export interface GetCreateAttachmentFormVariables {
  padId: string;
  fileName: string;
  fileType: string;
}
