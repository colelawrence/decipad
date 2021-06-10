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
import share from './share';
import hello from './hello';

type GraphqlModule = {
  typedefs: any
  resolvers: any
}

const modules: GraphqlModule[] = [
  base,
  date,
  glob,
  pagination,
  registration,
  users,
  auth,
  roles,
  workspaces,
  pads,
  share
];

if (process.env.NODE_ENV !== 'production') {
  modules.push(hello);
}

export default modules