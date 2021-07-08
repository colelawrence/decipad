import base from './base';
import date from './date';
import glob from './global';
import pagination from './pagination';
import registration from './registration';
import users from './users';
import auth from './auth';
import roles from './roles';
import workspaces from './workspaces';
import pads from './pads';
import tags from './tags';
import share from './share';
import attachments from './attachments';
import hello from './hello';

type GraphqlModule = {
  typedefs: any;
  resolvers?: any;
};
const modules: GraphqlModule[] = [
  base,
  date,
  glob,
  tags,
  pagination,
  registration,
  users,
  roles,
  workspaces,
  pads,
  attachments,
  share,
];

if (process.env.NODE_ENV !== 'production') {
  modules.push(hello);
  modules.push(auth); // fake auth
}

export default modules;
