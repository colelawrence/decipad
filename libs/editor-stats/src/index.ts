import { lazyLoad } from '@decipad/react-utils';

const loadStats = () =>
  import(/* webpackChunkName: "editor-stats" */ './EditorStats');
export const EditorStats = lazyLoad(loadStats);
