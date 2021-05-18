module.exports = (prop) => ({ [prop]: ida }, { [prop]: idb }) => {
  if (ida < idb) {
    return 1;
  } else if (idb < ida) {
    return -1;
  }
  return 0;
};
