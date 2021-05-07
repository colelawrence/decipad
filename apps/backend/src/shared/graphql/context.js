'use strict';

const auth = require('../auth');

const context = ({ NextAuthJWT }) => async ({ context }) => {
  const { user } = await auth(event, { NextAuthJWT });
  context.user = user;
  return context;
};

module.exports = context;
