const defaultBaseName = 'https://decipadstaging.com';

module.exports = function baseName() {
  return (
    (typeof window !== 'undefined' &&
      `docs.${window?.location?.hostname || 'decipadstaging.com'}`) ||
    defaultBaseName
  );
};
