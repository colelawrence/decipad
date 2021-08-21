/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CreatePad
// ====================================================

export interface CreatePad_createPad {
  __typename: "Pad";
  id: string;
  name: string;
}

export interface CreatePad {
  createPad: CreatePad_createPad;
}

export interface CreatePadVariables {
  workspaceId: string;
  name: string;
}
