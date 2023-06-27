import { captureException } from '@sentry/browser';
import { useEffect, useState } from 'react';

export type RemoteData<T> =
  | {
      status: 'not asked';
    }
  | {
      status: 'loading';
    }
  | {
      status: 'success';
      result: T;
    }
  | {
      status: 'error';
      error: string;
    };

export type RemoteDataStatus = RemoteData<any>['status'];

type Endpoints = {
  'generate-sql': {
    endpoint: `/api/ai/generate-sql/${string}`;
    body: string;
    response: {
      completion: string;
    };
  };
  'rewrite-paragraph': {
    endpoint: `/api/ai/rewrite-paragraph`;
    body: {
      prompt: string;
      paragraph: string;
    };
    response: {
      completion: string;
    };
  };
  'generate-fetch-js': {
    endpoint: '/api/ai/generate-fetch-js';
    body: {
      url: string;
      exampleRes: string;
      prompt: string;
    };
    response: {
      completion: string;
    };
  };
};
const notAsked = Symbol('not asked');

export const useRdFetch = <Name extends keyof Endpoints>(
  url: Endpoints[Name]['endpoint']
) => {
  type Endpoint = Endpoints[Name];
  type Response = Endpoint['response'];
  type Body = Endpoint['body'];

  const [body, setBody] = useState<Body | typeof notAsked>(notAsked);
  const [rd, setRd] = useState<RemoteData<Response>>({
    status: 'not asked',
  });

  useEffect(() => {
    if (body === notAsked) {
      return;
    }
    setRd({ status: 'loading' });
    let bodyStr: string;

    try {
      bodyStr = JSON.stringify(body);
    } catch (_) {
      setRd({ status: 'error', error: 'Something went wrong' });
      console.error('could not stringify body');
      captureException(
        new Error(`Could not stringify body when submitting to ${url}`)
      );
      return;
    }

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: bodyStr,
    })
      .then(async (res) => {
        if (res.status !== 200) {
          console.error(`Error generating code (${res.status})`, res);
          setRd({ status: 'error', error: 'Failed to generate code' });
          return;
        }

        let result: Response;
        try {
          result = await res.json();
        } catch (e) {
          console.error(e);
          console.error('result', res);
          setRd({ status: 'error', error: 'Something went wrong' });
          return;
        }

        setRd({ status: 'success', result });
      })
      .catch((error) => {
        console.error('an error has happened', error);
        captureException(error);
        setRd({ status: 'error', error });
      });
  }, [url, body]);

  return [rd, setBody] as const;
};
