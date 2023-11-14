const defaultBaseName = 'https://staging.decipad.com';

module.exports = function baseName() {
  return (
    (typeof window !== 'undefined' &&
      `docs.${window?.location?.hostname || 'staging.decipad.com'}`) ||
    defaultBaseName
  );
};
