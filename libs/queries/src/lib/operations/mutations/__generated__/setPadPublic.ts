/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: setPadPublic
// ====================================================

export interface setPadPublic_setPadPublic {
  __typename: 'Pad';
  id: string;
  isPublic: boolean | null;
}

export interface setPadPublic {
  setPadPublic: setPadPublic_setPadPublic;
}

export interface setPadPublicVariables {
  id: string;
  isPublic: boolean;
}
