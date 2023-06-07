import stringify from 'json-stringify-safe';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { parse as parseCookie } from 'simple-cookie';
import { parse as qsParse, ParsedUrlQuery } from 'querystring';
import { TOKEN_COOKIE_NAMES } from '@decipad/services/authentication';
import { boomify } from '@hapi/boom';

export default function adaptReqRes(handle: NextApiHandler) {
  return async function respondWithAuth(
    req: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyResultV2> {
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
        headers,
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

      function reply(
        replyBody: string | Record<string, any> | undefined = undefined
      ) {
        if (typeof replyBody === 'object') {
          if (replyBody.url) {
            const replyUrl = new URL(replyBody.url);
            const error = replyUrl.searchParams.get('error');
            if (error) {
              statusCode = 400;
              replyBody = { error, url: replyBody.url };
            }
          }
          if (!headers['content-type']) {
            headers['content-type'] = 'application/json; charset=utf-8';
          }
          replyBody = stringify(replyBody);
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

      try {
        handle(newReq as unknown as NextApiRequest, newRes as NextApiResponse);
      } catch (err) {
        console.error('caught', err);
        const boomed = boomify(err as Error);
        statusCode = boomed.output.statusCode;
        reply(boomed.output.payload);
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
