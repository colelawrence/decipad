import searchQuery from 'search-query-parser';
import Fuse from 'fuse.js';

const searchQueryOptions = {
  tokenize: true,
  keywords: ['status', 'visibility'],
};

function normalizeSearchText(text: string[] | string | undefined) {
  return text ? (Array.isArray(text) ? text : [text]) : [];
}

export function parseSearchInput(
  query: string
): [include: string[], exclude?: string[]] {
  const parsedSearchQS = searchQuery.parse(query, searchQueryOptions);
  if (typeof parsedSearchQS === 'string') return [[query]];
  const { text, exclude } = parsedSearchQS;
  const ExcText = exclude?.text as string;
  return [normalizeSearchText(text), normalizeSearchText(ExcText)];
}

export const ColorStatusNames = {
  draft: 'Draft',
  review: 'Review',
  approval: 'Approval',
  done: 'Done',
} as const;
export type TColorStatus = keyof typeof ColorStatusNames;
export const TColorKeys = Object.keys(ColorStatusNames);

export function acceptableStatus(
  status: (string | null)[] | never[]
): Fuse.Expression[] {
  const noNulls = status.filter((x) => x !== null) as string[];
  const statuses = noNulls
    .filter((st) => TColorKeys.includes(st))
    .map((st) => {
      return { status: st };
    });
  if (statuses.length > 0) return [{ $or: statuses }];
  return [];
}

export function acceptableVisibility(visibility: string): Fuse.Expression[] {
  if (visibility === 'public') {
    return [{ isPublic: 'true' }];
  }
  if (visibility === 'private') {
    return [{ $or: [{ isPublic: 'false' }, { isPublic: 'null' }] }];
  }
  return [];
}

export function buildFuseQuery({
  include,
  exclude,
  params,
}: {
  include: string[];
  exclude: string[];
  params?: Fuse.Expression[];
}): Fuse.Expression {
  const textPart: Fuse.Expression = {
    $or: [{ name: include.join(' ') }],
  };
  const paramPart: Fuse.Expression[] = params ?? [];
  const excludePart: Fuse.Expression[] = exclude.map((e) => {
    return { name: `!${e}` };
  });
  const fullQuery = {
    $and: [...paramPart, ...excludePart],
  };
  if (include.length > 0) {
    fullQuery.$and.push(textPart);
  }
  return fullQuery as Fuse.Expression;
}
