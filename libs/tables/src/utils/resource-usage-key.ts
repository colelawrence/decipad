import { ResourceConsumer, ResourceUsageTypes } from '@decipad/backendtypes';

export type ResourceKeyParams = {
  consumer: ResourceConsumer;
  consumerId: string;
  resource: ResourceUsageTypes;
  subType: string;
  field: string;
};

// /resource_type/sub_type/field_name/[users/workspaces]/id
export function getResourceUsageKey({
  resource,
  subType,
  field,
  consumer,
  consumerId,
}: ResourceKeyParams): string {
  return `${resource}/${subType}/${field}/${consumer}/${consumerId}`;
}
