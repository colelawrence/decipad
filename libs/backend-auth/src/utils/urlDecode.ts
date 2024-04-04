import type { ParsedUrlQuery } from 'querystring';
import { parse as qsParse } from 'querystring';

export function urlDecode(str: string): ParsedUrlQuery {
  return qsParse(str);
}
