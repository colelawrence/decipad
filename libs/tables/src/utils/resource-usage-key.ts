import { ResourceConsumer } from '@decipad/backendtypes';
import { ResourceTypes } from '@decipad/graphqlserver-types';

export type ResourceKeyParams = {
  consumer: ResourceConsumer;
  consumerId: string;
  resource: ResourceTypes;
  subType: string;
  field?: string;
};

// /resource_type/sub_type/field_name/[users/workspaces]/id
export function getResourceUsageKey({
  resource,
  subType,
  field,
  consumer,
  consumerId,
}: ResourceKeyParams): string {
  return `${resource}/${subType}/${field ?? 'null'}/${consumer}/${consumerId}`;
}
