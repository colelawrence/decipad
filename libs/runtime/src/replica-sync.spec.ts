import Automerge from 'automerge';
import { createReplica as replica } from './replica';
import { timeout } from './utils/timeout';
import { Runtime } from './runtime';
import { Sync } from './sync';
import fetch from 'jest-fetch-mock';

describe('replica sync', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });
  test('created locally eventually syncs to remote', async () => {
    const mockRuntime = ({
      userId: 'test user id',
      actorId: 'test actor id',
      sync: new Sync(),
    } as unknown) as Runtime;

    const r = replica<string>('/test/id', mockRuntime, '', true);

    r.mutate((s) => s + 'ABC');
    r.mutate((s) => s + 'DEF');

    await timeout(4000);

    expect(fetch.mock.calls).toHaveLength(2);
    expect(fetch.mock.calls[0][0]).toBe('/api/test/id');
    expect(fetch.mock.calls[0][1]).toBeUndefined(); // GET request
    expect(fetch.mock.calls[1][0]).toBe('/api/test/id');
    expect(
      Automerge.load(fetch!.mock!.calls![1]![1]!.body as string)
    ).toMatchObject({ value: 'ABCDEF' });

    r.stop();
  });

  test('created remotely eventually syncs to local', async () => {
    const mockRuntime = ({
      userId: 'test user id',
      actorId: 'test actor id',
      sync: new Sync(),
    } as unknown) as Runtime;

    const doc = Automerge.from({ value: 'ABCDEFGHIJK' });
    const docStr = Automerge.save(doc);
    fetch.mockResponse(docStr);

    const r = replica<string>('/test/id2', mockRuntime, '');

    await timeout(4000);

    expect(fetch.mock.calls).toHaveLength(1);
    expect(fetch.mock.calls[0][0]).toBe('/api/test/id2');
    expect(r.getValue()).toBe('ABCDEFGHIJK');

    r.stop();
  });
});
