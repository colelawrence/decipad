import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { HttpResponse } from '@architect/functions';
import { parse as parseCookie } from 'simple-cookie';
import { parse as qsParse, ParsedUrlQuery } from 'querystring';
import { TOKEN_COOKIE_NAMES } from '@decipad/services/authentication';

export default function adaptReqRes(handle: NextApiHandler) {
  return async function respondWithAuth(
    req: APIGatewayProxyEvent
  ): Promise<HttpResponse> {
    return new Promise((resolve) => {
      const { method, path } = req.requestContext.http;
      const url = req.rawPath;
      const pathParts = path.split('/');
      let action = pathParts[pathParts.length - 1];
      const provider = req.pathParameters && req.pathParameters.provider;
      if (provider === action) {
        action = pathParts[pathParts.length - 2];
      }

      const nextauth = [action];
      if (provider) {
        nextauth.push(provider);
      }

      const query = { nextauth, ...req.queryStringParameters };

      const headers: Record<string, string> = {};
      const cookies: string[] = [];

      // eslint-disable-next-line prefer-destructuring
      let body: string | ParsedUrlQuery | undefined = req.body;

      if (req.body && req.isBase64Encoded) {
        body = base64Decode(req.body as string);
      }

      if (
        body &&
        req.headers['content-type'] === 'application/x-www-form-urlencoded'
      ) {
        body = urlDecode(body);
      }

      if (!body) {
        body = {};
      }

      const newReq = {
        cookies: parseCookies(req.cookies),
        body,
        method,
        url,
        query,
      };

      let statusCode = 200;
      const newRes = {
        end: (buf: string | Buffer) => {
          reply(buf);
        },
        json: (json: Record<string, any>) => {
          reply(json);
        },
        send: (buf: string | Buffer) => {
          reply(buf);
        },
        setHeader: (key: string, value: string | string[]) => {
          if (Array.isArray(value)) {
            for (const val of value) {
              newRes.setHeader(key, val);
            }
            return;
          }
          key = key.toLowerCase();
          const existingValue = headers[key];
          if (key === 'set-cookie') {
            cookies.push(value);
            if (existingValue) {
              for (const cookieName of TOKEN_COOKIE_NAMES) {
                if (value.startsWith(cookieName)) {
                  headers[key] = value;
                  break;
                }
              }
            } else {
              headers[key] = value;
            }
          } else {
            headers[key] = value;
          }
        },
        getHeader: (key: string) => {
          return headers[key.toLowerCase()];
        },
        status: (code: number) => {
          statusCode = code;
          return newRes;
        },
        redirect: (redirectUrl: string) => {
          headers.Location = redirectUrl;
          statusCode = 302;
          reply();
        },
      };
      handle(newReq as unknown as NextApiRequest, newRes as NextApiResponse);

      function reply(
        replyBody: string | Record<string, any> | undefined = undefined
      ) {
        if (typeof replyBody === 'object') {
          replyBody = JSON.stringify(replyBody);
          if (!headers['content-type']) {
            headers['content-type'] = 'application/json; charset=utf-8';
          }
        }
        const response = {
          statusCode,
          headers,
          multiValueHeaders:
            cookies.length === 0 ? {} : { 'Set-Cookie': cookies },
          body: replyBody,
        };

        resolve(response);
      }
    });
  };
}

function parseCookies(cookies: string[] = []): Record<string, string> {
  return cookies.reduce((accCookies: Record<string, string>, cookie) => {
    const { name, value } = parseCookie(cookie) as {
      name: string;
      value: string;
    };
    accCookies[name] = decodeURIComponent(value);
    return accCookies;
  }, {});
}

function base64Decode(str: string): string {
  return Buffer.from(str, 'base64').toString();
}

function urlDecode(str: string): ParsedUrlQuery {
  return qsParse(str);
}
