import { lazy } from 'react';

const loadStats = () =>
  import(/* webpackChunkName: "editor-stats" */ './EditorStats');
export const EditorStats = lazy(loadStats);
