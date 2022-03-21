type Action =
  // Notebook operations
  | { action: 'notebook duplicated'; props?: undefined }
  | { action: 'notebook deleted'; props?: undefined }
  | { action: 'notebook created'; props?: undefined }
  // Editor actions
  | { action: 'notebook share link copied'; props?: undefined }
  | { action: 'notebook help link clicked'; props?: undefined }
  | { action: 'notebook code error docs link clicked'; props?: undefined }
  | { action: 'slash command'; props: { command: string } };

export type ActionEvent = {
  type: 'action';
} & Action;
