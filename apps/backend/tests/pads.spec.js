'use strict';

/* eslint-env jest */

const test = require('./utils/test-with-sandbox');
const call = require('./utils/call-simple');
const Automerge = require('automerge');

test('/api/pads', () => {
  let pad = {
    value: {
      id: 'padid1',
      name: 'pad one',
      permissions: [],
      tags: []
    }
  }
  let doc = Automerge.from(pad, 'agent id 1');

  it('PUT /api/pads/:id', () => {
    return call('/api/pads/padid1', {
      method: 'PUT',
      body: Automerge.save(doc),
      headers: {
        'Content-Type': 'text/text'
      }
    });
  });

  it('GET /api/pads/:id', async () => {
    const doc = await (await call('/api/pads/padid1')).text();
    expect(typeof doc).toBe('string')
    const pad2 = Automerge.load(doc, 'agent id 1')
    expect(pad2).toMatchObject(pad)
  })

  it('change and PUT again', async () => {
    doc = Automerge.change(doc, (doc) => {
      doc.value.name = 'pad name was changed'
    })

    return call('/api/pads/padid1', {
      method: 'PUT',
      body: Automerge.save(doc),
      headers: {
        'Content-Type': 'text/text'
      }
    });
  })


  it('GET /api/workspaces/:id', async () => {
    const doc = await (await call('/api/pads/padid1')).text();
    expect(typeof doc).toBe('string')
    const pad2 = Automerge.load(doc, 'agent id 1')
    expect(pad2).toMatchObject({
      value: {
        id: 'padid1',
        name: 'pad name was changed',
        permissions: [],
        tags: []
      }
    })
  })
});
