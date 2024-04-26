import { captureException } from '@sentry/browser';
import { useEffect, useState } from 'react';
import type { ChatCompletionMessageParam } from 'openai/resources/chat';

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
      code?: number;
    };

export type RemoteDataStatus = RemoteData<any>['status'];

export type Endpoints = {
  'generate-sql': {
    body: {
      workspaceId: string;
      externalDataSourceId: string;
      prompt: string;
    };
    response: {
      completion: string;
      usage: {
        promptTokensUsed?: number;
        completionTokensUsed?: number;
      };
    };
  };
  chat: {
    body: ChatCompletionMessageParam[];
    response: ChatCompletionMessageParam;
  };
  'rewrite-paragraph': {
    body: {
      prompt: string;
      paragraph: string;
      workspaceId: string;
    };
    response: {
      completion: string;
      usage: {
        promptTokensUsed?: number;
        completionTokensUsed?: number;
      };
    };
  };
  'generate-fetch-js': {
    body: {
      workspaceId: string;
      url: string;
      exampleRes: string;
      prompt: string;
    };
    response: {
      completion: string;
      usage: {
        promptTokensUsed?: number;
        completionTokensUsed?: number;
      };
    };
  };
  'complete-column': {
    body: {
      workspaceId: string;
      columnName: string;
      columnIndex: number;
      headerArray: string[];
      table: {
        cells: string[];
        rowId: string;
      }[];
    };
    response: {
      content: {
        id: string;
        columnIndex: number;
        suggestion: string;
      }[];
      usage: {
        promptTokensUsed?: number;
        completionTokensUsed?: number;
      };
    };
  };
};
const notAsked = Symbol('not asked');

export const useRdFetch = <Name extends keyof Endpoints>(endpoint: Name) => {
  type Endpoint = Endpoints[Name];
  type Response = Endpoint['response'];
  type Body = Endpoint['body'];

  const [body, setBody] = useState<Body | typeof notAsked>(notAsked);
  const [rd, setRd] = useState<RemoteData<Response>>({
    status: 'not asked',
  });
  const url = `/api/ai/${endpoint}`;

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
        new Error(`Could not stringify body when submitting to '${url}'`)
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
          console.error(`Request failed (${res.status})`, res);
          setRd({
            status: 'error',
            error: 'Request failed.',
            code: res.status,
          });
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
        console.error('AI hooks: an error has happened', error);
        captureException(error);
        setRd({ status: 'error', error });
      });
  }, [url, body]);

  return [rd, setBody] as const;
};
