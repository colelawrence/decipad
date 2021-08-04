/* eslint-env jest */

import Automerge from 'automerge';
import { encode } from './utils/resource';
import test from './sandbox';
import { create as createResourcePermission } from './utils/permissions';

test('sync docs', ({ test: it, http: { withAuth }, auth }) => {
  let call: ReturnType<typeof withAuth>;
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
    const { token } = await auth();
    call = withAuth(token);
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
    const doc = await (
      await call(`/api/syncdoc/${encode('/pads/padid')}`)
    ).text();
    expect(typeof doc).toBe('string');
    const pad2 = Automerge.load(doc, 'agent id 1');
    expect(pad2).toMatchObject(pad);
  });

  it('change and PUT again', async () => {
    doc = Automerge.change(doc, (doc) => {
      doc.value.name = 'pad name was changed';
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
    const doc = await (
      await call(`/api/syncdoc/${encode('/pads/padid')}`)
    ).text();
    expect(typeof doc).toBe('string');
    const pad2 = Automerge.load(doc, 'agent id 1');
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
    doc = Automerge.change(doc, (doc) => {
      doc.value.name = 'pad name was changed again';
    });

    await call(`/api/syncdoc/${encode('/pads/padid')}/changes`, {
      method: 'PUT',
      body: JSON.stringify(Automerge.getChanges(before, doc)),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('GET /api/syncdoc/:id', async () => {
    const doc = await (
      await call(`/api/syncdoc/${encode('/pads/padid')}`)
    ).text();
    expect(typeof doc).toBe('string');
    const pad2 = Automerge.load(doc, 'agent id 1');
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
