import { lazyLoad } from '@decipad/react-utils';

const loadTopbar = () => import('./Topbar');
export const Topbar = lazyLoad(loadTopbar);

const loadSidebar = () => import('./sidebar');
export const Sidebar = lazyLoad(loadSidebar);

const loadEditor = () => import('./Editor');
export const Editor = lazyLoad(loadEditor);

const loadTabs = () => import('./Tabs');
export const Tabs = lazyLoad(loadTabs);

const loadNavigationSidebar = () => import('./NavigationSidebar');
export const NavigationSidebar = lazyLoad(loadNavigationSidebar);

export const Loaders = {
  loadTopbar,
  loadSidebar,
  loadEditor,
  loadTabs,
  loadNavigationSidebar,
} as const;
