type Action =
  // Notebook operations
  | { action: 'notebook duplicated'; props?: undefined }
  | { action: 'notebook deleted'; props?: undefined }
  | { action: 'notebook created'; props?: undefined }
  | { action: 'notebook shared'; props: { url: string } }
  // Editor actions
  | { action: 'slash command'; props: { command: string } };

export type ActionEvent = {
  type: 'action';
} & Action;
