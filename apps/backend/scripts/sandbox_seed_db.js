const arc = require('@architect/functions');

(async () => {
  const tables = await arc.tables();

  const newUser1 = {
    id: 'test user id 1',
    name: 'Test User',
    last_login: Date.now(),
    avatar: null,
    email: 'test1@decipad.com',
  };

  await tables.users.put(newUser1);

  const newUser2 = {
    id: 'test user id 2',
    name: 'Test User 2',
    last_login: Date.now(),
    avatar: null,
    email: 'pedro@n1n.co',
  };

  await tables.users.put(newUser2);
})();
