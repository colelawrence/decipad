import attachments from './attachments';
import annotations from './annotations';
import base from './base';
import date from './date';
import externalData from './external-data';
import glob from './global';
import hello from './hello';
import pads from './pads';
import pagination from './pagination';
import registration from './registration';
import roles from './roles';
import sections from './sections';
import tags from './tags';
import users from './users';
import workspaces from './workspaces';
import logs from './logs-module';
import secrets from './secrets';
import workspaceSubscriptions from './workspaceSubscriptions';
import workspaceExecutedQueries from './workspaceExecutedQueries';
import resourceUsage from './resource-usage';
import pricing from './pricing';
import templates from './templates';

type GraphqlModule = {
  resolvers: unknown;
};
const modules: GraphqlModule[] = [
  base,
  date,
  glob,
  tags,
  sections,
  pagination,
  registration,
  users,
  roles,
  workspaces,
  pads,
  attachments,
  externalData,
  logs,
  secrets,
  workspaceSubscriptions,
  workspaceExecutedQueries,
  resourceUsage,
  pricing,
  annotations,
  templates,
];

if (process.env.NODE_ENV !== 'production') {
  modules.push(hello);
}

export default modules;
