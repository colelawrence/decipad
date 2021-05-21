const arc = require('@architect/functions');
const { nanoid } = require('nanoid');

(async () => {
  const tables = await arc.tables();

  const newUser1 = {
    id: 'test user id 1',
    name: 'Test User',
    last_login: Date.now(),
    image: null,
    email: 'test1@decipad.com',
    secret: nanoid(),
  };

  await tables.users.put(newUser1);

  const newUserKey1 = {
    id: `email:${newUser1.email}`,
    user_id: newUser1.id,
  };

  await tables.userkeys.put(newUserKey1);

  const newUser2 = {
    id: 'test user id 2',
    name: 'Test User 2',
    last_login: Date.now(),
    image: null,
    email: 'test2@decipad.com',
    secret: nanoid(),
  };

  await tables.users.put(newUser2);

  const newUserKey2 = {
    id: `email:${newUser2.email}`,
    user_id: newUser2.id,
  };

  await tables.userkeys.put(newUserKey2);
})();
