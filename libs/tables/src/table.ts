import { DataTables, TableName } from '@decipad/backendtypes';
import { enhance, observe, withWithVersion } from './tableExtensions';
import { ArcServices } from './types';

const enhancedTables: Set<keyof DataTables> = new Set([
  'docsyncupdates',
  'users',
  'anonusers',
  'userkeys',
  'userbackups',
  'permissions',
  'workspaces',
  'pads',
  'sections',
  'workspaceroles',
  'invites',
  'futurefileattachments',
  'fileattachments',
  'externaldatasources',
  'externaldatasourcekeys',
  'secrets',
  'workspacesubscriptions',
  'resourceusages',
  'externaldatasnapshots',
  'workspacenumbers',
]);

const observedTables: Set<keyof DataTables> = new Set([
  'userkeys',
  'permissions',
  'tags',
  'usertaggedresources',
  'fileattachments',
  'docsyncupdates',
  'docsyncsnapshots',
  'userbackups',
  'pads',
]);

const versionedTables: Set<keyof DataTables> = new Set(['docsync']);

export const tablesProp = <T extends keyof DataTables>(
  tables: DataTables,
  services: ArcServices,
  propName: T
): DataTables[T] => {
  const target = tables[propName];
  if (enhancedTables.has(propName)) {
    // eslint-disable-next-line no-underscore-dangle
    enhance(tables, propName as TableName, tables._doc, services);
  }

  if (observedTables.has(propName)) {
    observe(tables, propName);
  }
  if (versionedTables.has(propName)) {
    // eslint-disable-next-line no-underscore-dangle
    withWithVersion(tables, tables._doc, propName);
  }
  return target;
};

