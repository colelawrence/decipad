/* eslint-env jest */

// existing tests very granular
/* eslint-disable jest/expect-expect */

import Automerge from 'automerge';
import { testWithSandbox as test } from '@decipad/backend-test-sandbox';
import { encode } from './utils/resource';
import { create as createResourcePermission } from './utils/permissions';

test('sync docs', (ctx) => {
  const { test: it } = ctx;
  let call: ReturnType<typeof ctx.http.withAuth>;
  const pad = {
    value: {
      id: 'padid1',
      name: 'pad one',
      permissions: [],
      tags: [],
    },
  };
  let doc = Automerge.from(pad, 'agent id 1');

  beforeAll(async () => {
    const { token } = await ctx.auth();
    call = ctx.http.withAuth(token);
  });

  beforeAll(async () => {
    await createResourcePermission({
      userId: 'test user id 1',
      resourceType: 'pads',
      resourceId: 'padid',
      type: 'WRITE',
      givenByUserId: 'test user id 1',
    });
  });

  it('PUT /api/syncdoc/:id', async () => {
    await call(`/api/syncdoc/${encode('/pads/padid')}`, {
      method: 'PUT',
      body: Automerge.save(doc),
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  });

  it('GET /api/syncdoc/:id', async () => {
    const fetchedDoc = await (
      await call(`/api/syncdoc/${encode('/pads/padid')}`)
    ).text();
    expect(typeof fetchedDoc).toBe('string');
    const pad2 = Automerge.load(fetchedDoc, 'agent id 1');
    expect(pad2).toMatchObject(pad);
  });

  it('change and PUT again', async () => {
    doc = Automerge.change(doc, (updateDoc) => {
      // eslint-disable-next-line no-param-reassign
      updateDoc.value.name = 'pad name was changed';
    });

    await call(`/api/syncdoc/${encode('/pads/padid')}`, {
      method: 'PUT',
      body: Automerge.save(doc),
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  });

  it('GET /api/syncdoc/:id 2', async () => {
    const fetchedDoc = await (
      await call(`/api/syncdoc/${encode('/pads/padid')}`)
    ).text();
    expect(typeof fetchedDoc).toBe('string');
    const pad2 = Automerge.load(fetchedDoc, 'agent id 1');
    expect(pad2).toMatchObject({
      value: {
        id: 'padid1',
        name: 'pad name was changed',
        permissions: [],
        tags: [],
      },
    });
  });

  it('PUT /api/syncdoc/:id/changes replicates only changes', async () => {
    const before = doc;
    doc = Automerge.change(doc, (updateDoc) => {
      // eslint-disable-next-line no-param-reassign
      updateDoc.value.name = 'pad name was changed again';
    });

    await call(`/api/syncdoc/${encode('/pads/padid')}/changes`, {
      method: 'PUT',
      body: JSON.stringify(Automerge.getChanges(before, doc)),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('GET /api/syncdoc/:id again', async () => {
    const fetchedDoc = await (
      await call(`/api/syncdoc/${encode('/pads/padid')}`)
    ).text();
    expect(typeof fetchedDoc).toBe('string');
    const pad2 = Automerge.load(fetchedDoc, 'agent id 1');
    expect(pad2).toMatchObject({
      value: {
        id: 'padid1',
        name: 'pad name was changed again',
        permissions: [],
        tags: [],
      },
    });
  }, 10000);
});
