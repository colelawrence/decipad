'use strict';

/* eslint-env jest */

import test from './utils/test-with-sandbox';
import { withAuth } from './utils/call-simple';
import auth from './utils/auth';
import Automerge from 'automerge';

test('/api/pads', () => {
  let call;
  let pad = {
    value: {
      id: 'padid1',
      name: 'pad one',
      permissions: [],
      tags: [],
    },
  };
  let doc = Automerge.from(pad, 'agent id 1');

  beforeAll(async () => {
    call = withAuth(await auth());
  });

  it('PUT /api/pads/:id', () => {
    return call('/api/pads/padid1', {
      method: 'PUT',
      body: Automerge.save(doc),
      headers: {
        'Content-Type': 'text/text',
      },
    });
  });

  it('GET /api/pads/:id', async () => {
    const doc = await (await call('/api/pads/padid1')).text();
    expect(typeof doc).toBe('string');
    const pad2 = Automerge.load(doc, 'agent id 1');
    expect(pad2).toMatchObject(pad);
  });

  it('change and PUT again', async () => {
    doc = Automerge.change(doc, (doc) => {
      doc.value.name = 'pad name was changed';
    });

    return call('/api/pads/padid1', {
      method: 'PUT',
      body: Automerge.save(doc),
      headers: {
        'Content-Type': 'text/text',
      },
    });
  });

  it('GET /api/pads/:id', async () => {
    const doc = await (await call('/api/pads/padid1')).text();
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

  it('PUT /api/pads/:id/changes replicates only changes', async () => {
    const before = doc;
    doc = Automerge.change(doc, (doc) => {
      doc.value.name = 'pad name was changed again';
    });

    return call('/api/pads/padid1/changes', {
      method: 'PUT',
      body: JSON.stringify(Automerge.getChanges(before, doc)),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('GET /api/pads/:id', async () => {
    const doc = await (await call('/api/pads/padid1')).text();
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
