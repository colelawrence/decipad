const arc = require('@architect/functions');

module.exports = async function get(id) {
  const tables = await arc.tables();
  let doc = await tables.syncdoc.get({ id });
  if (!doc) {
    return null;
  }
  return doc.latest;
};
