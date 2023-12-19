import { APIGatewayProxyEventV2 } from 'aws-lambda';

type ID = string;

// copied from dataTypes.ts
type User = {
  id: ID;
  name: string;
  description?: string;
  email?: string | null;
  image?: string | null;
  createdAt?: number | Date;
  last_login?: number;
  first_login?: number;
  hideChecklist?: boolean;
  onboarded?: boolean;
};

export type GraphqlContext = {
  additionalHeaders: Map<string, string>;
  user?: User;
  subscriptionId?: ID;
  connectionId?: ID;
  snapshotName?: string;
  event: APIGatewayProxyEventV2;
  readingModePermission?: boolean;
};
