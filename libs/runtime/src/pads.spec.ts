import { DeciRuntime } from './';
import { timeout } from './utils/timeout';
import { nanoid } from 'nanoid';

const USER_ID = nanoid();
const ACTOR_ID = nanoid();

describe('pads', () => {
  const workspaceId = nanoid();

  beforeAll(async () => {
    const deci = new DeciRuntime(USER_ID, ACTOR_ID);
    const workspace = {
      id: workspaceId,
      name: 'Test workspace',
      permissions: [],
    };
    await deci.workspaces.create(workspace);
    deci.stop();
  });

  test('starts with zero elements', (done) => {
    const deci = new DeciRuntime(USER_ID, ACTOR_ID);
    const pads = deci.workspace(workspaceId).pads.list();
    let ended = false;
    pads.subscribe(({ loading, data: ids }) => {
      if (!loading && !ended) {
        expect(ids).toHaveLength(0);
        ended = true;
        deci.stop();
        done();
      }
    });
  });

  test('starts with zero tags', () => {
    const deci = new DeciRuntime(USER_ID, ACTOR_ID);
    const tagKeys = deci.workspace(workspaceId).pads.byTag.keys();
    let lastSeen: string[] | null = null;
    tagKeys.subscribe((keys) => {
      lastSeen = keys;
    });

    expect(lastSeen).toHaveLength(0);
    deci.stop();
  });

  test('adding a pad with tags gets indexed', async () => {
    const deci = new DeciRuntime(USER_ID, ACTOR_ID);

    const pads = deci.workspace(workspaceId).pads.list();
    let lastSeenPadIds: Id[] | null = null;
    pads.subscribe(({ loading, data }) => {
      if (!loading) {
        lastSeenPadIds = data;
      }
    });

    const tagKeys = deci.workspace(workspaceId).pads.byTag.keys();
    let lastSeenTags: string[] | null = null;
    tagKeys.subscribe((keys) => {
      lastSeenTags = keys;
    });

    const newPad = {
      id: 'pad id 1',
      name: 'Test pad 1',
      workspaceId: workspaceId,
      lastUpdatedAt: new Date(),
      permissions: [],
      tags: ['tag 1', 'tag 2'],
    };
    await deci.workspace(workspaceId).pads.create(newPad);

    expect(lastSeenPadIds).toHaveLength(1);
    expect(lastSeenPadIds![0]).toBe('pad id 1');

    await timeout(100);

    expect(lastSeenTags).toHaveLength(2);
    expect(lastSeenTags![0]).toBe('tag 1');
    expect(lastSeenTags![1]).toBe('tag 2');

    deci
      .workspace(workspaceId)
      .pads.byTag.get('tag 1')
      .subscribe(({ loading, data: pads }) => {
        if (!loading) {
          expect(pads).toHaveLength(1);
          expect(pads![0]).toBe('pad id 1');
          deci.stop();
        }
      });
  });

  test('adding another pad with a common tag also gets indexed', async () => {
    const deci = new DeciRuntime(USER_ID, ACTOR_ID);

    const pads = deci.workspace(workspaceId).pads.list();
    let lastSeenPadIds: Id[] | null = null;
    pads.subscribe(({ loading, data }) => {
      if (!loading) {
        lastSeenPadIds = data;
      }
    });

    const tagKeys = deci.workspace(workspaceId).pads.byTag.keys();
    let lastSeenTags: string[] | null = null;
    tagKeys.subscribe((keys) => {
      lastSeenTags = keys;
    });

    const newPad = {
      id: 'pad id 2',
      name: 'Test pad 2',
      workspaceId: workspaceId,
      lastUpdatedAt: new Date(),
      permissions: [],
      tags: ['tag 2', 'tag 3'],
    };
    await deci.workspace(workspaceId).pads.create(newPad);

    expect(lastSeenPadIds).toHaveLength(2);
    expect(lastSeenPadIds![0]).toBe('pad id 1');
    expect(lastSeenPadIds![1]).toBe('pad id 2');

    await timeout(100);

    expect(lastSeenTags).toHaveLength(3);
    expect(lastSeenTags![0]).toBe('tag 1');
    expect(lastSeenTags![1]).toBe('tag 2');
    expect(lastSeenTags![2]).toBe('tag 3');

    deci
      .workspace(workspaceId)
      .pads.byTag.get('tag 2')
      .subscribe(({ loading, data: pads }) => {
        if (!loading) {
          expect(pads).toHaveLength(2);
          expect(pads![0]).toBe('pad id 1');
          expect(pads![1]).toBe('pad id 2');
          deci.stop();
        }
      });
  });

  test('removing a pad removes the tag index', async (done) => {
    const deci = new DeciRuntime(USER_ID, ACTOR_ID);

    const pads = deci.workspace(workspaceId).pads.list();
    let lastSeenPadIds: Id[] | null = null;
    pads.subscribe(({ loading, data }) => {
      if (!loading) {
        lastSeenPadIds = data;
      }
    });

    const tagKeys = deci.workspace(workspaceId).pads.byTag.keys();
    let lastSeenTags: string[] | null = null;
    tagKeys.subscribe((keys) => {
      lastSeenTags = keys;
    });

    // removing a pad that does not exist works
    await deci.workspace(workspaceId).pads.removePad('pad id does not exist');

    await deci.workspace(workspaceId).pads.removePad('pad id 1');

    expect(lastSeenPadIds).toHaveLength(1);
    expect(lastSeenPadIds![0]).toBe('pad id 2');

    await timeout(100);

    expect(lastSeenTags).toHaveLength(2);
    expect(lastSeenTags![0]).toBe('tag 2');
    expect(lastSeenTags![1]).toBe('tag 3');

    deci
      .workspace(workspaceId)
      .pads.byTag.get('tag 2')
      .subscribe(({ loading, data: pads }) => {
        if (!loading) {
          expect(pads).toHaveLength(1);
          expect(pads![0]).toBe('pad id 2');
          deci.stop();
          done();
        }
      });
  });

  test('updating a pad updates the tag index', async (done) => {
    const deci = new DeciRuntime(USER_ID, ACTOR_ID);

    const tagKeys = deci.workspace(workspaceId).pads.byTag.keys();
    let lastSeenTags: string[] | null = null;
    tagKeys.subscribe((keys) => {
      lastSeenTags = keys;
    });

    deci.workspace(workspaceId).pads.update('pad id 2', { tags: ['tag 3'] });

    await timeout(100);

    expect(lastSeenTags).toHaveLength(1);
    expect(lastSeenTags![0]).toBe('tag 3');

    deci
      .workspace(workspaceId)
      .pads.byTag.get('tag 2')
      .subscribe(({ loading, data: pads }) => {
        if (!loading) {
          expect(pads).toHaveLength(0);
          deci
            .workspace(workspaceId)
            .pads.byTag.get('tag 3')
            .subscribe(({ loading, data: pads }) => {
              if (!loading) {
                expect(pads).toHaveLength(1);
                expect(pads![0]).toBe('pad id 2');
                deci.stop();
                done();
              }
            });
        }
      });
  });
});
