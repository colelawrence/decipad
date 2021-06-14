import { DeciRuntime } from './';

const USER_ID = 'test user id';
const ACTOR_ID = 'test actor id';

describe('runtime', () => {
  test('supports session', () => {
    const deci = new DeciRuntime({ userId: USER_ID, actorId: ACTOR_ID });

    let lastSession;
    const sub = deci.getSession().subscribe((session) => {
      lastSession = session;
    });

    expect(deci.getSessionValue()).toBeNull();

    deci.setSession({
      user: {
        id: 'id',
        name: 'name',
        email: 'email@example.com',
        avatar: 'avatar',
      },
    });

    expect(deci.getSessionValue()).toMatchObject({
      user: {
        id: 'id',
        name: 'name',
        email: 'email@example.com',
        avatar: 'avatar',
      },
    });

    expect(lastSession).toMatchObject({
      user: {
        id: 'id',
        name: 'name',
        email: 'email@example.com',
        avatar: 'avatar',
      },
    });

    sub.unsubscribe();
    deci.stop();
  });
});
