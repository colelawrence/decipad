import tables from './tables';

export async function isAuthorized(resource: string, user: TableRecordIdentifier, permissionType: PermissionType = 'READ'): Promise<boolean> {
  if (resource.endsWith('/')) {
    resource = resource.substring(0, resource.length - 1);
  }
  const data = await tables();
  const permissions: PermissionRecord[] = (
    await data.permissions.query({
      IndexName: 'byResourceAndUser',
      KeyConditionExpression:
        'user_id = :user_id and resource_uri = :resource_uri',
      ExpressionAttributeValues: {
        ':user_id': user.id,
        ':resource_uri': resource,
      },
    })
  ).Items;

  return permissions.some(isEnoughPermissionFor(permissionType));
}

function isEnoughPermissionFor(requiredPermissionType: PermissionType) {
  return (existingPermission: PermissionRecord): boolean => {
    if (requiredPermissionType === 'READ') {
      return true;
    }
    if (requiredPermissionType === 'WRITE') {
      return (
        existingPermission.type === 'WRITE' ||
        existingPermission.type === 'ADMIN'
      );
    }
    return existingPermission.type === requiredPermissionType;
  };
}
