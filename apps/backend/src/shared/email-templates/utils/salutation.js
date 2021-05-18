'use strict';

module.exports = function salutation(user) {
  if (!user.name) {
    return 'Hi,';
  }
  return `Dear ${user.name}`;
};
