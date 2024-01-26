import { lazyLoad } from '@decipad/react-utils';

const loadTopbar = () => import('./Topbar');
export const Topbar = lazyLoad(loadTopbar);

const loadAssistantChat = () => import('./AssistantChat');
export const AssistantChat = lazyLoad(loadAssistantChat);

const loadSidebar = () => import('./Sidebar');
export const Sidebar = lazyLoad(loadSidebar);

const loadEditor = () => import('./Editor');
export const Editor = lazyLoad(loadEditor);

const loadTabs = () => import('./Tabs');
export const Tabs = lazyLoad(loadTabs);

export const Loaders = {
  loadTopbar,
  loadAssistantChat,
  loadSidebar,
  loadEditor,
  loadTabs,
} as const;
