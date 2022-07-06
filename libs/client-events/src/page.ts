type WorkspacePageEvent = {
  type: 'page';
  url: string;
  category: 'workspace';
  props?: {
    title: string;
  };
};
type NotebookPageEvent = {
  type: 'page';
  url: string;
  category: 'notebook';
  props?: {
    title: string;
  };
};
type PlaygroundPageEvent = {
  type: 'page';
  url: string;
  category: 'playground';
  props?: {
    title: string;
  };
};
export type PageEvent =
  | WorkspacePageEvent
  | NotebookPageEvent
  | PlaygroundPageEvent;
