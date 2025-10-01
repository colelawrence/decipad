/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
import type { ParsedUrlQuery } from 'querystring';
import stringify from 'json-stringify-safe';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';
import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { boomify } from '@hapi/boom';
import { TOKEN_COOKIE_NAMES } from '@decipad/services/authentication';
import { app } from '@decipad/backend-config';
import { debug } from './debug';
import { base64Decode } from './utils/base64Decode';
import { urlDecode } from './utils/urlDecode';
import { parseCookies } from './utils/parseCookies';

export interface ReplyBody {
  url: string;
  error?: string;
}

export default function adaptReqRes(handle: NextApiHandler) {
  console.log('Adapt-req-res Debug - NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
  console.log('Adapt-req-res Debug - AUTH_URL:', process.env.AUTH_URL);
  console.log('Adapt-req-res Debug - app().urlBase:', app().urlBase);

  return async function respondWithAuth(
    req: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyResultV2> {
    debug('auth request', req);
    return new Promise((resolve) => {
      const { method, path } = req.requestContext.http;
      let url = req.rawPath;

      // Correct the URL port if it's localhost with wrong port
      try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'localhost') {
          const configuredBaseUrl = app().urlBase;
          console.log(
            'Adapt-req-res Debug - configuredBaseUrl:',
            configuredBaseUrl
          );
          const configuredUrl = new URL(configuredBaseUrl);
          if (urlObj.port !== configuredUrl.port) {
            console.log(
              'Adapt-req-res Debug - Correcting URL port from',
              urlObj.port,
              'to',
              configuredUrl.port
            );
            urlObj.port = configuredUrl.port;
            url = urlObj.toString();
          }
        }
      } catch (e) {
        console.error(e);
        // If URL parsing fails, keep the original URL
        console.log(
          'Adapt-req-res Debug - Failed to parse URL, keeping original:',
          url
        );
      }
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

      if (body) {
        if (
          req.headers['content-type'] === 'application/x-www-form-urlencoded'
        ) {
          body = urlDecode(body);
        } else if (
          req.headers['content-type']?.startsWith('application/json')
        ) {
          try {
            body = JSON.parse(body);
          } catch (err) {
            resolve({
              statusCode: 400,
              body: JSON.stringify({ error: (err as Error).message }),
            });
            return;
          }
        }
      }

      if (!body) {
        body = {};
      }

      let statusCode = 200;

      const reply = (
        replyBody: Buffer | string | ReplyBody | undefined = undefined
      ) => {
        let isBase64Encoded = false;
        if (typeof replyBody === 'object') {
          if (!Buffer.isBuffer(replyBody)) {
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
          } else {
            replyBody = Buffer.from(replyBody).toString('base64');
            isBase64Encoded = true;
          }
        }
        const response = {
          statusCode,
          headers,
          multiValueHeaders:
            cookies.length === 0 ? {} : { 'Set-Cookie': cookies },
          body: replyBody,
          isBase64Encoded,
        };

        debug('auth response', response);

        resolve(response);
      };

      const newReq = {
        cookies: parseCookies(req.cookies),
        body,
        method,
        url,
        query,
        headers,
      };

      const newRes = {
        end: (buf: string | Buffer) => {
          reply(buf);
        },
        json: (json: Record<string, unknown>) => {
          // If the json contains a "url" property, ensure its origin matches app().urlBase
          if (json && typeof json.url === 'string') {
            try {
              const urlObj = new URL(json.url);
              const appUrlBase = app().urlBase;
              const appOrigin = new URL(appUrlBase).origin;
              if (urlObj.origin !== appOrigin) {
                // Change the origin to match app().urlBase, keep the rest of the URL
                urlObj.protocol = new URL(appUrlBase).protocol;
                urlObj.host = new URL(appUrlBase).host;
                json.url = urlObj.toString();
              }
            } catch (e) {
              // If parsing fails, do nothing
            }
          }
          reply(json as unknown as ReplyBody);
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
          // Ensure redirectUrl matches the same origin as app().urlBase
          try {
            const appUrlBase = app().urlBase;
            const appOrigin = new URL(appUrlBase).origin;
            const redirectObj = new URL(redirectUrl, appUrlBase);
            if (redirectObj.origin !== appOrigin) {
              console.log(
                'Adapt-req-res Debug - Correcting redirect URL origin from',
                redirectObj.origin,
                'to',
                appOrigin
              );
              // Change the origin to match app().urlBase, keep the rest of the URL
              redirectObj.protocol = new URL(appUrlBase).protocol;
              redirectObj.host = new URL(appUrlBase).host;
              redirectUrl = redirectObj.toString();
            }
          } catch (e) {
            // If parsing fails, do nothing
            console.error(e);
          }
          headers.Location = redirectUrl;
          statusCode = 302;
          reply();
        },
      };

      try {
        handle(
          newReq as unknown as NextApiRequest,
          newRes as NextApiResponse
        ).catch((err) => {
          console.error('caught', err);
          const boomed = boomify(err as Error);
          resolve({
            ...boomed.output,
            body: stringify(boomed.output.payload),
            headers: { 'Content-Type': 'application/json' },
          });
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('caught', err);
        const boomed = boomify(err as Error);
        resolve({
          ...boomed.output,
          body: stringify(boomed.output.payload),
          headers: { 'Content-Type': 'application/json' },
        });
      }
    });
  };
}
