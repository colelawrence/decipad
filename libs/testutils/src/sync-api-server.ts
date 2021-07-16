import assert from 'assert';
import { DeciWebsocketServer } from './ws-server';
import Automerge from 'automerge';
import { timeout } from './timeout';

interface IApiServerOptions {
  fetchPrefix: string;
  maxTinyTimeout: number;
}

export function apiServer(
  deciWebsocketServer: DeciWebsocketServer,
  { fetchPrefix, maxTinyTimeout }: IApiServerOptions
) {
  const store = new Map<string, string>();
  return async (req: Request) => {
    assert(req.url.startsWith(fetchPrefix));
    await randomTinyTimeout();

    let resp;
    if (
      req.method === 'GET' &&
      req.url === fetchPrefix + '/api/auth/token?for=pubsub'
    ) {
      return {
        status: 200,
        body: 'thisisagreattokenjustforyou',
      };
    }
    if (req.method === 'PUT') {
      if (req.url.endsWith('/changes')) {
        resp = await changes(req);
      } else {
        resp = await put(req);
      }
    } else {
      resp = await get(req);
    }

    await randomTinyTimeout();

    return resp;
  };

  async function changes(req: Request) {
    try {
      const prefixLength = (fetchPrefix + '/api/syncdoc/').length;
      const key = decodeURIComponent(
        req.url.substring(prefixLength, req.url.length - '/changes'.length)
      );
      if (store.has(key)) {
        const before = Automerge.load(store.get(key)!);
        const changes = await req.json();
        const after = Automerge.applyChanges(before, changes);
        await randomTinyTimeout();
        store.set(key, Automerge.save(after));

        // websocket notify subscribers
        if (changes.length > 0) {
          const topic = decode(key);
          deciWebsocketServer.notify(
            topic,
            JSON.stringify({ o: 'c', t: topic, c: changes })
          );
        }

        return {
          status: 201,
        };
      }

      return {
        status: 404,
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async function put(req: Request) {
    try {
      const prefixLength = (fetchPrefix + '/api/syncdoc/').length;
      const key = decodeURIComponent(req.url.substring(prefixLength));
      const remoteText = await req.text();
      const before = Automerge.load(store.get(key) || remoteText);
      const remote = Automerge.load(remoteText);
      const after = Automerge.merge(before, remote);

      await randomTinyTimeout();
      store.set(key, Automerge.save(after));

      // websocket notify subscribers
      const changes = Automerge.getChanges(before, after);
      if (changes.length > 0) {
        const topic = decode(key);
        deciWebsocketServer.notify(
          topic,
          JSON.stringify({ o: 'c', t: topic, c: changes })
        );
      }

      return {
        status: 201,
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async function get(req: Request) {
    try {
      const prefixLength = (fetchPrefix + '/api/syncdoc/').length;
      const key = decodeURIComponent(req.url.substring(prefixLength));
      if (store.has(key)) {
        return {
          status: 200,
          body: store.get(key),
        };
      }

      return {
        status: 404,
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  function randomTinyTimeout() {
    return timeout(Math.floor(Math.random() * maxTinyTimeout));
  }
}

export function decode(id: string | undefined): string {
  let newId = (id || '').replace(/:/g, '/');
  if (!newId.startsWith('/')) {
    newId = '/' + newId;
  }
  return newId;
}
