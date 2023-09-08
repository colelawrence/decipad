export const loadCrucialDependencies = async () => {
  await Promise.all([
    import(/* webpackChunkName: "app-with-meta" */ './AppWithMeta'),
    import(
      /* webpackChunkName: "workspace" */ './workspaces/workspace/Workspace'
    ),
    import(/* webpackChunkName: "notebooks" */ './notebooks/Notebooks'),

    import(
      /* webpackChunkName: "notebook-editor-icon" */ './notebooks/notebook/EditorIcon'
    ),
    import(
      /* webpackChunkName: "notebook-editor" */ './notebooks/notebook/Editor'
    ),
  ]);
};
