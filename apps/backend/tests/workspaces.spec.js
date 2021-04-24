'use strict';

/* eslint-env jest */

const test = require('./utils/test-with-sandbox');
const call = require('./utils/call-simple');
const Automerge = require('automerge');

test('/api/workspaces', () => {
  let workspace = {
    value: {
      id: 'workspaceid1',
      name: 'workspace one',
      permissions: []
    }
  }
  let doc = Automerge.from(workspace, 'agent id 1');

  it('PUT /api/workspaces/:id', () => {
    return call('/api/workspaces/workspaceid1', {
      method: 'PUT',
      body: Automerge.save(doc),
      headers: {
        'Content-Type': 'text/text'
      }
    });
  });

  it('GET /api/workspaces/:id', async () => {
    const doc = await (await call('/api/workspaces/workspaceid1')).text();
    expect(typeof doc).toBe('string')
    const workspace2 = Automerge.load(doc, 'agent id 1')
    expect(workspace2).toMatchObject(workspace)
  })

  it('change and PUT again', async () => {
    doc = Automerge.change(doc, (doc) => {
      doc.value.name = 'name was changed'
    })

    return call('/api/workspaces/workspaceid1', {
      method: 'PUT',
      body: Automerge.save(doc),
      headers: {
        'Content-Type': 'text/text'
      }
    });
  })


  it('GET /api/workspaces/:id', async () => {
    const doc = await (await call('/api/workspaces/workspaceid1')).text();
    expect(typeof doc).toBe('string')
    const workspace2 = Automerge.load(doc, 'agent id 1')
    expect(workspace2).toMatchObject({
      value: {
        id: 'workspaceid1',
        name: 'name was changed',
        permissions: []
      }
    })
  })
});
