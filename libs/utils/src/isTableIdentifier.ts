export const isTableIdentifier = (text?: string): string[] => {
  if (!text) {
    return [];
  }
  // Check if the string contains a dot
  if (text.includes('.')) {
    // Split the string by the dot
    const parts = text.split('.');

    // Check if there is only one dot
    if (parts.length === 2) {
      const tableName = parts[0];
      const columnName = parts[1];
      if (
        typeof tableName === 'string' &&
        tableName.trim() !== '' &&
        tableName.trim() === tableName &&
        typeof columnName === 'string' &&
        columnName.trim() !== '' &&
        columnName.trim() === columnName
      ) {
        return parts;
      }
    }
  }

  // Return undefined if there is no dot or more than one dot
  return [];
};
