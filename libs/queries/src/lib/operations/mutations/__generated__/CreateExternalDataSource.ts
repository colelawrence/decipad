/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ExternalProvider } from "./../../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: CreateExternalDataSource
// ====================================================

export interface CreateExternalDataSource_createExternalDataSource {
  __typename: "ExternalDataSource";
  id: string;
  dataUrl: string;
  authUrl: string;
}

export interface CreateExternalDataSource {
  createExternalDataSource: CreateExternalDataSource_createExternalDataSource | null;
}

export interface CreateExternalDataSourceVariables {
  name: string;
  padId: string;
  provider: ExternalProvider;
  externalId: string;
}
