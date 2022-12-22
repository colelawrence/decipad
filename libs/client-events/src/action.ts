type Action =
  // Notebook operations
  | { action: 'notebook duplicated'; props?: undefined }
  | { action: 'notebook shared'; props?: undefined }
  | { action: 'notebook deleted'; props?: undefined }
  | { action: 'notebook created'; props?: undefined }
  // Visitor
  | { action: 'try decipad'; props?: undefined }
  // Editor actions
  | { action: 'number field updated'; props: { isReadOnly: boolean } }
  | { action: 'notebook share link copied'; props?: undefined }
  | { action: 'notebook get inspiration link clicked'; props?: undefined }
  | { action: 'notebook help link clicked'; props?: undefined }
  | { action: 'notebook code error docs link clicked'; props?: undefined }
  | { action: 'slash command'; props: { command: string } }
  // Codeline actions
  | { action: 'number converted to code line'; props?: undefined }
  | { action: 'number created with ='; props?: undefined }
  | { action: 'code line teleported'; props?: undefined }
  | { action: 'code line teleported back'; props?: undefined };

export type ActionEvent = {
  type: 'action';
} & Action;
