/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: ImportPad
// ====================================================

export interface ImportPad_importPad {
  __typename: "Pad";
  id: string;
  name: string;
}

export interface ImportPad {
  importPad: ImportPad_importPad;
}

export interface ImportPadVariables {
  workspaceId: string;
  source: string;
}
