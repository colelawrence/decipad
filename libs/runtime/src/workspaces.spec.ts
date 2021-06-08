import { nanoid } from 'nanoid';
import { DeciRuntime } from './';

const USER_ID = 'test user id';
const ACTOR_ID = 'workspace test actor id';

describe('workspaces', () => {
  let existingId = '';
  let workspaceId = '';
  test('starts with zero elements', (done) => {
    const deci = new DeciRuntime(USER_ID, ACTOR_ID);
    const workspaces = deci.workspaces.list();
    workspaces.subscribe(({ loading, data: ids }) => {
      if (!loading) {
        expect(ids).toHaveLength(0);
        deci.stop();
        done();
      }
    });
  });

  test('can push id', async () => {
    const deci = new DeciRuntime(USER_ID, ACTOR_ID);
    const workspaces = deci.workspaces.list();
    let lastSeen: Id[] | null = null;
    const sub = workspaces.subscribe(({ data }) => {
      lastSeen = data;
    });

    const id = (existingId = nanoid());
    await deci.workspaces.push(id);
    expect(lastSeen).toHaveLength(1);
    expect(lastSeen![0]).toBe(id);
    sub.unsubscribe();
    deci.stop();
  });

  test('can insert id at given position', async () => {
    const deci = new DeciRuntime(USER_ID, ACTOR_ID);
    const workspaces = deci.workspaces.list();
    let lastSeen: Id[] | null = null;
    const sub = workspaces.subscribe(({ data }) => {
      lastSeen = data;
    });

    const id = nanoid();
    await deci.workspaces.insertAt(0, id);
    expect(lastSeen).toHaveLength(2);
    expect(lastSeen![0]).toBe(id);
    sub.unsubscribe();
    deci.stop();
  });

  test('removes existing id', async () => {
    const deci = new DeciRuntime(USER_ID, ACTOR_ID);
    const workspaces = deci.workspaces.list();
    let lastSeen: Id[] | null = null;
    const sub = workspaces.subscribe(({ data }) => {
      lastSeen = data;
    });

    await deci.workspaces.remove(existingId);

    expect(lastSeen).toHaveLength(1);
    expect(lastSeen![0]).not.toBe(existingId);
    sub.unsubscribe();
    deci.stop();
  });

  test('getting non-existing workspace yields null', () => {
    const deci = new DeciRuntime(USER_ID, ACTOR_ID);
    let lastSeen: Workspace | null = null;
    const sub = deci.workspaces
      .get('non existing workspace id')
      .subscribe(({ data }) => {
        lastSeen = data;
      });
    expect(lastSeen).toBeNull();
    sub.unsubscribe();
    deci.stop();
  });

  test('can create workspace', async () => {
    const deci = new DeciRuntime(USER_ID, ACTOR_ID);
    workspaceId = nanoid();
    const workspace = {
      id: workspaceId,
      name: 'Test workspace',
      permissions: [],
    };

    await deci.workspaces.create(workspace);

    deci.stop();
  });

  test('can retrieve observable for existing workspace', () => {
    const deci = new DeciRuntime(USER_ID, ACTOR_ID);
    let lastSeen: Workspace | null = null;
    const sub = deci.workspaces.get(workspaceId).subscribe(({ data }) => {
      lastSeen = data;
    });
    expect(lastSeen).toMatchObject({
      id: workspaceId,
      name: 'Test workspace',
      permissions: [],
    });
    sub.unsubscribe();
    deci.stop();
  });

  test('can update workspace', async () => {
    const deci = new DeciRuntime(USER_ID, ACTOR_ID);
    let lastSeen: Workspace | null = null;
    const sub = deci.workspaces.get(workspaceId).subscribe(({ data }) => {
      lastSeen = data;
    });

    await deci.workspaces.update(workspaceId, {
      name: 'Test workspace renamed',
    });

    expect(lastSeen).toMatchObject({
      id: workspaceId,
      name: 'Test workspace renamed',
      permissions: [],
    });

    sub.unsubscribe();
    deci.stop();
  });
});
