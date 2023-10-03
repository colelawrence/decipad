import { DocumentNode } from 'graphql';
import attachments from './attachments';
import auth from './auth';
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
import share from './share';
import tags from './tags';
import users from './users';
import workspaces from './workspaces';
import logs from './logs-module';
import secrets from './secrets';
import workspaceSubscriptions from './workspaceSubscriptions';
import workspaceExecutedQueries from './workspaceExecutedQueries';
import notion from './notion';
import assistant from './assistant';

type GraphqlModule = {
  typedefs: DocumentNode;
  resolvers?: unknown;
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
  share,
  externalData,
  logs,
  secrets,
  workspaceSubscriptions,
  workspaceExecutedQueries,
  notion,
  assistant,
];

if (process.env.NODE_ENV !== 'production') {
  modules.push(hello);
  modules.push(auth); // fake auth
}

export default modules;
