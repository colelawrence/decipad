type PageCategory = 'workspace' | 'notebook' | 'playground';

export type PageEvent = {
  type: 'page';
  url: string;
  category: PageCategory;
};
