import { parse as qsParse, ParsedUrlQuery } from 'querystring';

export function urlDecode(str: string): ParsedUrlQuery {
  return qsParse(str);
}
