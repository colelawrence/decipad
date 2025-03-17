import handle from '../handle';
import { completeColumnHandler } from './completeColumn';
import { generateSqlHandler } from './generateSql';
import { notFound } from '@hapi/boom';
import { generateFetchHandler } from './generateFetch';
import { rewriteParagraphHandler } from './rewriteParagraph';

export const handler = handle(async (event, user) => {
  const method = event.rawPath.replace('/api/ai/', '');
  switch (method) {
    case 'generate-sql':
      return generateSqlHandler(event, user);
    case 'complete-column':
      return completeColumnHandler(event, user);
    case 'generate-fetch-js':
      return generateFetchHandler(event, user);
    case 'rewrite-paragraph':
      return rewriteParagraphHandler(event, user);
    default:
      throw notFound(`Method ${method} not found`);
  }
});
