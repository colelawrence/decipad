export const getBoolean = (value: string | boolean | undefined) =>
  typeof value === 'boolean' ? value : value === 'true';
