type WorkspacePageEvent = {
  type: 'page';
  url: string;
  category: 'Workspace Loaded';
  props?: {
    title: string;
  };
};
type NotebookPageEvent = {
  type: 'page';
  url: string;
  category: 'Notebook Loaded';
  props?: {
    title: string;
  };
};
type PlaygroundPageEvent = {
  type: 'page';
  url: string;
  category: 'Playground Loaded';
  props?: {
    title: string;
  };
};
export type PageEvent =
  | WorkspacePageEvent
  | NotebookPageEvent
  | PlaygroundPageEvent;
